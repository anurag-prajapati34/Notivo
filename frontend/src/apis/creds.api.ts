import type { EmailCreds } from "../types";
import { getAuthToken } from "../utils/auth-helpers";
import { makeGetReuqest, makePostRequest } from "../utils/axios";
import { endpoints } from "./config";

export const setEmailCredsApi = async (input: EmailCreds) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }

  const headers = { Authorization: `Bearer ${token}` };
  return await makePostRequest(endpoints.setEmailCreds, input, {
    headers,
  });
};

export const getApiKeyApi = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  return await makeGetReuqest(endpoints.getApiKey, { headers });
};
