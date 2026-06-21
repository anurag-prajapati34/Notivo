import axios from "axios";
import type { ApiResponseType } from "../types";

export const makeGetReuqest = async (url: string) => {
  try {
    const response = await axios.get(url);
    return await response.data;
  } catch (error) {
    console.error(error);
  }
};

export const makePostRequest = async (url: string, data: any) => {
  try {
    console.log("Post request api call---");
    const response = await axios.post(url, data);
    console.log("Post request response---", response);

    return response.data;
  } catch (error) {
    console.error(error);
  }
};
