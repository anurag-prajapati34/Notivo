import { db } from "@/database/connection.js";
import {
  NewEmailTemplate,
  NewEmailTemplateVariable,
} from "@/database/schema/index.js";
import {
  checkTemplateSlugExistsQuery,
  createTemplateQuery,
  deleteTemplateQuery,
  deleteTemplateVariablesByTemplateIdQuery,
  getTemplateByTemplateIdAndUserIdQuery,
  getTemplatesByUserIdQuery,
  getTemplateVariablesByTemplateIdQuery,
  getTemplateVariablesByTemplateIdsQuery,
  insertTemplateVariablesQuery,
  updateTemplateQuery,
} from "@/routes/v1/templates/queries.js";
import {
  CreateTemplateSchema,
  UpdateTemplateSchema,
} from "@/routes/v1/templates/validator.js";
import { extractVariables } from "@/utils/extract-variables.js";
import { logger } from "@/utils/logger.js";
import { AuthRequest } from "@/utils/types.js";
import { Response } from "express";

/**
 * GET /api/v1/templates
 * Get all templates for the authenticated user, including their variables.
 */
export const getTemplatesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const templates = await getTemplatesByUserIdQuery(userId);
    const templateIds = templates.map((t) => t.templateId);
    const variables = await getTemplateVariablesByTemplateIdsQuery(templateIds);

    const data = templates.map((template) => ({
      ...template,
      variables: variables.filter((v) => v.templateId === template.templateId),
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err: any) {
    logger.error("Error in getTemplates handler", { error: err });
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

/**
 * GET /api/v1/templates/:templateId
 * Get single template by templateId and userId, including its variables.
 */
export const getTemplateByIdHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const templateId = req.params.templateId as string;
    if (!templateId) {
      return res
        .status(400)
        .json({ success: false, error: "Template ID parameter is required" });
    }

    const template = await getTemplateByTemplateIdAndUserIdQuery(
      templateId,
      userId,
    );
    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: "Template not found" });
    }

    const variables = await getTemplateVariablesByTemplateIdQuery(templateId);

    return res.status(200).json({
      success: true,
      data: {
        ...template,
        variables,
      },
    });
  } catch (err: any) {
    logger.error("Error in getTemplateById handler", { error: err });
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

/**
 * POST /api/v1/templates
 * Create a new email template and extract/save variables inside a transaction.
 */
export const createTemplateHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const parseResult = CreateTemplateSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessage =
        parseResult.error.issues[0]?.message || "Validation failed";
      return res.status(400).json({ success: false, error: errorMessage });
    }

    const { name, slug, subject, html, description } = parseResult.data;

    // Check slug uniqueness for this user
    const slugExists = await checkTemplateSlugExistsQuery(slug, userId);
    if (slugExists) {
      return res
        .status(409)
        .json({ success: false, error: "Template slug already exists" });
    }

    const templateId = slug;
    const extractedVarNames = extractVariables(html, subject);

    let createdTemplate: any = null;
    let createdVariables: any[] = [];

    await db.transaction(async (trx) => {
      const newTemplate: NewEmailTemplate = {
        templateId,
        userId,
        name,
        slug,
        subject,
        html,
        description: description || null,
        status: true,
      };

      await createTemplateQuery(newTemplate, trx);

      if (extractedVarNames.length > 0) {
        const variableRecords: NewEmailTemplateVariable[] =
          extractedVarNames.map((varName) => ({
            templateId,
            variableName: varName,
            isRequired: true,
            status: true,
          }));
        await insertTemplateVariablesQuery(variableRecords, trx);
      }

      createdTemplate = await getTemplateByTemplateIdAndUserIdQuery(
        templateId,
        userId,
        trx,
      );
      createdVariables = await getTemplateVariablesByTemplateIdQuery(
        templateId,
        trx,
      );
    });

    return res.status(201).json({
      success: true,
      data: {
        template: createdTemplate,
        variables: createdVariables,
      },
    });
  } catch (err: any) {
    logger.error("Error in createTemplate handler", { error: err });
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

/**
 * PUT /api/v1/templates/:templateId
 * Update an existing template and re-extract/save variables inside a transaction.
 */
export const updateTemplateHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const templateId = req.params.templateId as string;
    if (!templateId) {
      return res
        .status(400)
        .json({ success: false, error: "Template ID parameter is required" });
    }

    const parseResult = UpdateTemplateSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessage =
        parseResult.error.issues[0]?.message || "Validation failed";
      return res.status(400).json({ success: false, error: errorMessage });
    }

    const body = parseResult.data;

    // Verify template belongs to req.user.userId
    const existingTemplate = await getTemplateByTemplateIdAndUserIdQuery(
      templateId,
      userId,
    );
    if (!existingTemplate) {
      return res
        .status(404)
        .json({ success: false, error: "Template not found" });
    }

    // If slug is being updated, check new slug doesn't already exist for this user
    if (body.slug && body.slug !== existingTemplate.slug) {
      const slugExists = await checkTemplateSlugExistsQuery(
        body.slug,
        userId,
        templateId,
      );
      if (slugExists) {
        return res
          .status(409)
          .json({ success: false, error: "Template slug already exists" });
      }
    }

    const targetTemplateId = body.slug || templateId;
    const finalHtml =
      body.html !== undefined ? body.html : existingTemplate.html;
    const finalSubject =
      body.subject !== undefined ? body.subject : existingTemplate.subject;

    const extractedVarNames = extractVariables(finalHtml, finalSubject);

    let updatedTemplate: any = null;
    let updatedVariables: any[] = [];

    await db.transaction(async (trx) => {
      const updateData: Partial<NewEmailTemplate> = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.slug !== undefined) {
        updateData.slug = body.slug;
        updateData.templateId = body.slug;
      }
      if (body.subject !== undefined) updateData.subject = body.subject;
      if (body.html !== undefined) updateData.html = body.html;
      if (body.description !== undefined)
        updateData.description = body.description;

      // Delete existing variables first to avoid FK issues if templateId changes
      await deleteTemplateVariablesByTemplateIdQuery(templateId, trx);

      // Update emailTemplates record
      await updateTemplateQuery(templateId, userId, updateData, trx);

      // Re-insert newly extracted variables
      if (extractedVarNames.length > 0) {
        const variableRecords: NewEmailTemplateVariable[] =
          extractedVarNames.map((varName) => ({
            templateId: targetTemplateId,
            variableName: varName,
            isRequired: true,
            status: true,
          }));
        await insertTemplateVariablesQuery(variableRecords, trx);
      }

      updatedTemplate = await getTemplateByTemplateIdAndUserIdQuery(
        targetTemplateId,
        userId,
        trx,
      );
      updatedVariables = await getTemplateVariablesByTemplateIdQuery(
        targetTemplateId,
        trx,
      );
    });

    return res.status(200).json({
      success: true,
      data: {
        template: updatedTemplate,
        variables: updatedVariables,
      },
    });
  } catch (err: any) {
    logger.error("Error in updateTemplate handler", { error: err });
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

/**
 * DELETE /api/v1/templates/:templateId
 * Delete a template and its variables after verifying ownership and checking default template rules.
 */
export const deleteTemplateHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const templateId = req.params.templateId as string;
    if (!templateId) {
      return res
        .status(400)
        .json({ success: false, error: "Template ID parameter is required" });
    }

    // Verify template belongs to req.user.userId
    const existingTemplate = await getTemplateByTemplateIdAndUserIdQuery(
      templateId,
      userId,
    );
    if (!existingTemplate) {
      return res
        .status(404)
        .json({ success: false, error: "Template not found" });
    }

    // Check if this is a seeded/default template
    const defaultTemplates = [
      "welcome-email",
      "otp-verification",
      "password-reset",
    ];
    if (defaultTemplates.includes(templateId.toLowerCase())) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot delete default templates" });
    }

    await db.transaction(async (trx) => {
      // Delete template variables first (FK constraint)
      await deleteTemplateVariablesByTemplateIdQuery(templateId, trx);
      // Delete template
      await deleteTemplateQuery(templateId, userId, trx);
    });

    return res.status(200).json({ success: true, message: "Template deleted" });
  } catch (err: any) {
    logger.error("Error in deleteTemplate handler", { error: err });
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};
