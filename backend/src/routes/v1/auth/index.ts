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

/**
 * Create a new user
 */
route.post("/signup", validateSignupRequestBody, signupHandler);

/*
 * Login a user
 */
route.post("/login", loginHandler);

/**
 * Get API Key of a user
 */
route.get("/api-key", authenticate, getApiKeyHandler);

/**
 * Generate New API Key
 */
route.post("/generate-api-key", authenticate, generateApiKeyHandler);
export default route;
