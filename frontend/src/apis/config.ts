const baseUrl = import.meta.env.VITE_API_BASE_URL;
const endpoints = {
  login: `${baseUrl}/auth/login`,
  signup: `${baseUrl}/auth/signup `,
  setEmailCreds: `${baseUrl}/email/creds`,
  getApiKey: `${baseUrl}/auth/api-key`,
  getEmailTemplates: `${baseUrl}/email/templates`,
};

export { endpoints };
