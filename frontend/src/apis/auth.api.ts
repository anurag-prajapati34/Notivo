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
  //send in basic auth headers not in body
  const response = (await makePostRequest(
    endpoints.login,
    {},
    {
      headers: {
        Authorization: `Basic ${btoa(`${input.email}:${input.password}`)}`,
      },
    },
  )) as ApiResponseType<LoginResponseType>;

  localStorage.setItem(getAuthTokenKey(), response.data.token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      email: response.data.email,
      mobile: response.data.mobile,
      dialCode: response.data.dialCode,
      firstName: response.data.firstName,
      middleName: response.data.middleName,
      lastName: response.data.lastName,
      userType: response.data.userType,
    }),
  );

  return response;
};
