import type {
  ApiResponseType,
  Email,
  EmailCreds,
  EmailDetail,
  EmailTemplate,
  SendEmail,
} from "../types";
import { getAuthToken } from "../utils/auth-helpers";
import { makeGetReuqest, makePostRequest } from "../utils/axios";
import { endpoints } from "./config";
import { getApiKeyApi } from "./creds.api";

export const getEmailTemplatesApi = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  return (await makeGetReuqest(endpoints.getEmailTemplates, {
    headers,
  })) as ApiResponseType<EmailTemplate[]>;
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
  return (await makePostRequest(endpoints.sendTestEmail, emailCreds, {
    headers,
  })) as ApiResponseType<null | {}>;
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
