export interface User {
  firstName: string;
  lastName: string;
  email: string;
}
export interface Login {
  email: string;
  password: string;
}

export interface Signup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile: string;
}

export interface LoginResponseType {
  token: string;
}

export interface ApiResponseType<T> {
  data: T;
  message: string;
  success: boolean;
}
