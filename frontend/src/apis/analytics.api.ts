import type { AnalyticsStats, ApiResponseType } from "../types";
import { getAuthToken } from "../utils/auth-helpers";
import { makeGetReuqest } from "../utils/axios";
import { endpoints } from "./config";

export const getAnalyticsStatsApi = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No token found");
  }
  const headers = { Authorization: `Bearer ${token}` };
  return (await makeGetReuqest(endpoints.getAnalyticsStats, {
    headers,
  })) as ApiResponseType<AnalyticsStats>;
};
