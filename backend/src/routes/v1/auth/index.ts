import { authenticate } from "@/middleware/auth.js";
import express from "express";
import {
  generateApiKeyHandler,
  getApiKeyHandler,
  loginHandler,
  signupHandler,
} from "./handler";
import {
  validateLoginRequestBody,
  validateSignupRequestBody,
} from "./prehandler";
const route = express.Router();

route.post("/signup", validateSignupRequestBody, signupHandler);
route.post("/login", validateLoginRequestBody, loginHandler);

route.get("/api-key", authenticate, getApiKeyHandler);
route.post("/generate-api-key", authenticate, generateApiKeyHandler);
export default route;
