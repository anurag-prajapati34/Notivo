import axios from "axios";
import type { ApiResponseType } from "../types";
import { clearUserAuthSession } from "./auth-helpers";

// Configure the Axios instance
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearUserAuthSession();
    }

    return Promise.reject(error);
  },
);

export const makeGetReuqest = async (
  url: string,
  options?: {
    headers?: any;
  },
) => {
  try {
    const response = await axios.get(url, options);
    return await response.data;
  } catch (error) {
    console.error(error);
  }
};

export const makePostRequest = async (
  url: string,
  data: any,
  options?: {
    headers?: any;
  },
) => {
  try {
    const response = await axios.post(url, data, options);
    return response.data as ApiResponseType<any>;
  } catch (error) {
    console.error(error);
  }
};
