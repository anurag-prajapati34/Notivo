import { authenticate, authenticateApiKey } from "@/middleware/auth";
import express from "express";
import {
  getEmailsListHandler,
  getEmailTemplatesHandler,
  sendEmailHandler,
  setEmailCredsHandler,
} from "./handler";
import {
  validateEmailCredsRequestBody,
  validateSendEmailRequestBody,
} from "./prehandler";

const route = express.Router();

// send email route
route.post(
  "/send",
  authenticateApiKey,
  validateSendEmailRequestBody,
  sendEmailHandler,
);
route.post(
  "/creds",
  authenticate,
  validateEmailCredsRequestBody,
  setEmailCredsHandler,
);

route.get("/templates", authenticate, getEmailTemplatesHandler);

route.get("/list", authenticate, getEmailsListHandler);

export default route;
