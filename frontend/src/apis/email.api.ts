import type {
  ApiResponseType,
  CreateTemplatePayload,
  Email,
  EmailCreds,
  EmailDetail,
  EmailTemplate,
  SendEmail,
  UpdateTemplatePayload,
} from "../types";
import { getAuthToken } from "../utils/auth-helpers";
import {
  makeDeleteRequest,
  makeGetReuqest,
  makePostRequest,
  makePutRequest,
} from "../utils/axios";
import { endpoints } from "./config";
import { getApiKeyApi } from "./creds.api";

export const getEmailTemplatesApi = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  try {
    return (await makeGetReuqest(endpoints.getEmailTemplates, {
      headers,
    })) as ApiResponseType<EmailTemplate[]>;
  } catch (error) {
    // Fallback to /email/templates if /templates returns error
    return (await makeGetReuqest(`${import.meta.env.VITE_API_BASE_URL}/email/templates`, {
      headers,
    })) as ApiResponseType<EmailTemplate[]>;
  }
};

export const getEmailTemplateByIdApi = async (templateId: string) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  try {
    return (await makeGetReuqest(`${endpoints.templates}/${templateId}`, {
      headers,
    })) as ApiResponseType<EmailTemplate>;
  } catch (error) {
    return (await makeGetReuqest(`${import.meta.env.VITE_API_BASE_URL}/email/templates/${templateId}`, {
      headers,
    })) as ApiResponseType<EmailTemplate>;
  }
};

export const createTemplateApi = async (data: CreateTemplatePayload) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  try {
    return (await makePostRequest(endpoints.templates, data, {
      headers,
    })) as ApiResponseType<EmailTemplate>;
  } catch (error) {
    return (await makePostRequest(`${import.meta.env.VITE_API_BASE_URL}/email/templates`, data, {
      headers,
    })) as ApiResponseType<EmailTemplate>;
  }
};

export const updateTemplateApi = async (
  templateId: string,
  data: UpdateTemplatePayload,
) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  try {
    return (await makePutRequest(`${endpoints.templates}/${templateId}`, data, {
      headers,
    })) as ApiResponseType<EmailTemplate>;
  } catch (error) {
    return (await makePutRequest(`${import.meta.env.VITE_API_BASE_URL}/email/templates/${templateId}`, data, {
      headers,
    })) as ApiResponseType<EmailTemplate>;
  }
};

export const deleteTemplateApi = async (templateId: string) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  try {
    return (await makeDeleteRequest(`${endpoints.templates}/${templateId}`, {
      headers,
    })) as ApiResponseType<null | {}>;
  } catch (error) {
    return (await makeDeleteRequest(`${import.meta.env.VITE_API_BASE_URL}/email/templates/${templateId}`, {
      headers,
    })) as ApiResponseType<null | {}>;
  }
};

export const getEmailsListApi = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  return (await makeGetReuqest(endpoints.getEmailsList, {
    headers,
  })) as ApiResponseType<Email[]>;
};

export const sendTestEmailApi = async (emailCreds: EmailCreds) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  return await makePostRequest(endpoints.sendTestEmail, emailCreds, {
    headers,
  });
};

export const getEmailDetailApi = async (emailId: number) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  return (await makeGetReuqest(endpoints.getEmailDetails + `/${emailId}`, {
    headers,
  })) as ApiResponseType<EmailDetail>;
};

export const sendEmailApi = async (payload: SendEmail) => {
  const result = await getApiKeyApi();
  const apiKey = result.data.apiKey;
  if (!apiKey) throw new Error("API key not found");

  const headers = { Authorization: `Bearer ${apiKey}` };
  return (await makePostRequest(endpoints.sendEmail, payload, {
    headers,
  })) as ApiResponseType<null | {}>;
};
