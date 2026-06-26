import type {
  ApiResponseType,
  Login,
  LoginResponseType,
  Signup,
} from "../types";
import { getAuthTokenKey } from "../utils/auth-helpers";
import { makePostRequest } from "../utils/axios";
import { endpoints } from "./config";

export const signup = async (input: Signup) => {
  const data = await makePostRequest(endpoints.signup, input);

  return data;
};

export const login = async (input: Login) => {
  const response = (await makePostRequest(
    endpoints.login,
    input,
  )) as ApiResponseType<LoginResponseType>;

  localStorage.setItem(getAuthTokenKey(), response.data.token);

  return response;
};
