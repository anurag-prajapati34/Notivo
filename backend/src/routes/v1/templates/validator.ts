import { z } from "zod";

export const CreateTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug cannot exceed 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(255, "Subject cannot exceed 255 characters"),
  html: z.string().min(1, "HTML content is required"),
  description: z.string().optional().nullable(),
});

export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;

export const UpdateTemplateSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),
    slug: z
      .string()
      .min(1, "Slug cannot be empty")
      .max(100, "Slug cannot exceed 100 characters")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      )
      .optional(),
    subject: z
      .string()
      .min(1, "Subject cannot be empty")
      .max(255, "Subject cannot exceed 255 characters")
      .optional(),
    html: z.string().min(1, "HTML content cannot be empty").optional(),
    description: z.string().optional().nullable(),
  })
  .refine(
    (data) =>
      Object.keys(data).some(
        (key) => data[key as keyof typeof data] !== undefined,
      ),
    {
      message: "At least one field must be provided for update",
    },
  );

export type UpdateTemplateInput = z.infer<typeof UpdateTemplateSchema>;
