import { authenticate } from "@/middleware/auth";
import express from "express";
import { getApiKeyHandler, loginHandler, signupHandler } from "./handler";
import {
  validateLoginRequestBody,
  validateSignupRequestBody,
} from "./prehandler";
const route = express.Router();

route.post("/signup", validateSignupRequestBody, signupHandler);
route.post("/login", validateLoginRequestBody, loginHandler);

route.get("/api-key", authenticate, getApiKeyHandler);
export default route;
