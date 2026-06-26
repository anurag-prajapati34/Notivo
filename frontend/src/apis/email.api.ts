import type { ApiResponseType, EmailTemplate } from "../types";
import { getAuthToken } from "../utils/auth-helpers";
import { makeGetReuqest } from "../utils/axios";
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
