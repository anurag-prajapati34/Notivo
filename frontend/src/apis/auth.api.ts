import type {
  ApiResponseType,
  Login,
  LoginResponseType,
  Signup,
} from "../types";
import { makePostRequest } from "../utils/axios";
import { endpoints } from "./config";

export const signup = async (input: Signup) => {
  const data = await makePostRequest(endpoints.signup, input);

  return data;
};

export const getAuthTokenKey = () => {
  return import.meta.env.VITE_TOKEN_KEY || "notivo";
};

export const login = async (input: Login) => {
  const response = (await makePostRequest(
    endpoints.login,
    input,
  )) as ApiResponseType<LoginResponseType>;

  console.log("login API Post REsponse----", response);
  localStorage.setItem(getAuthTokenKey(), response.data.token);

  return response;
};
