import type {
  ApiResponseType,
  Email,
  EmailCreds,
  EmailTemplate,
} from "../types";
import { getAuthToken } from "../utils/auth-helpers";
import { makeGetReuqest, makePostRequest } from "../utils/axios";
import { endpoints } from "./config";

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
  return (await makeGetReuqest(endpoints.getLogs, {
    headers,
  })) as ApiResponseType<Email>;
};
