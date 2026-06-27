import { getAnalyticsStatusQuery } from "./queries";

export const getAnalyticsStatsService = (input: { userId: number }) => {
  try {
    const result = getAnalyticsStatusQuery(input);
    return result;
  } catch (error) {
    throw error;
  }
};
