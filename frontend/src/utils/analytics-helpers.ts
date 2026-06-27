import type { AnalyticsStats } from "../types";

export const parseAnalyticsOverviewObject = (
  overview: AnalyticsStats["overview"],
) => {
  console.log("Overview---", overview);
  if (!overview) return [];
  const delivered = overview.delivered || 0;
  const failed = overview.failed || 0;
  const pending = overview.pending || 0;
  const total = delivered + failed + pending;

  const getPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(2);
  };
  return [
    {
      emailStatus: "Total Sent",
      count: total,
      percentage: "100",
    },
    {
      emailStatus: "Delivered",
      count: delivered,
      percentage: getPercentage(delivered, total),
    },
    {
      emailStatus: "Failed",
      count: failed,
      percentage: getPercentage(failed, total),
    },
    {
      emailStatus: "Pending",
      count: pending,
      percentage: getPercentage(pending, total),
    },
  ];
};

export const parseAnalyticsTemplateUsageData = (
  templateUsage: AnalyticsStats["templateUsage"],
) => {
  if (!templateUsage) return [];
  return templateUsage.map((item) => ({
    name: item.templateName,
    value: item.count,
  }));
};
