import type { User } from "../types";

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

export const getAuthUserKey = () => "user";
export const getAuthUser = () => {
  return JSON.parse(localStorage.getItem(getAuthUserKey()) || "{}") as User;
};
