export const getAuthTokenKey = () => {
  return import.meta.env.VITE_TOKEN_KEY || "notivo";
};
export const getAuthToken = () => {
  const tokenKey = getAuthTokenKey();

  return localStorage.getItem(tokenKey) ?? null;
};

export const clearUserAuthSession = () => {
  localStorage.removeItem(getAuthTokenKey());
  window.location.href = "/login";
};
