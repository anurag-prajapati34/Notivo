import express from "express";
import { loginHandler, signupHandler } from "./handler";
import {
  validateLoginRequestBody,
  validateSignupRequestBody,
} from "./prehandler";
const route = express.Router();

route.post("/signup", validateSignupRequestBody, signupHandler);
route.post("/login", validateLoginRequestBody, loginHandler);
export default route;
