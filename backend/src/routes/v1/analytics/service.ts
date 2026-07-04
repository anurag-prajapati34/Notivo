import { getAnalyticsStatusQuery } from "./queries.js";

export const getAnalyticsStatsService = (input: { userId: number }) => {
  try {
    const result = getAnalyticsStatusQuery(input);
    return result;
  } catch (error) {
    throw error;
  }
};
