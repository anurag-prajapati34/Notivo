const baseUrl = import.meta.env.VITE_API_BASE_URL;
const endpoints = {
  login: `${baseUrl}/auth/login`,
  signup: `${baseUrl}/auth/signup `,
  setEmailCreds: `${baseUrl}/email/creds`,
  getApiKey: `${baseUrl}/auth/api-key`,
  getEmailTemplates: `${baseUrl}/email/templates`,
  getEmailsList: `${baseUrl}/email/list`,
  getAnalyticsStats: `${baseUrl}/analytics/stats`,
  generateApiKey: `${baseUrl}/auth/generate-api-key`,
  getEmailCreds: `${baseUrl}/email/creds`,
  sendTestEmail: `${baseUrl}/email/test`,
  getEmailDetails: `${baseUrl}/email/details`,
};

export { endpoints };
