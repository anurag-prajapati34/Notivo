import { authenticate, authenticateApiKey } from "@/middleware/auth.js";
import express from "express";
import {
  getEmailCredsHandler,
  getEmailDetailsHandler,
  getEmailsListHandler,
  getEmailTemplatesHandler,
  sendEmailHandler,
  sendTestEmailHandler,
  setEmailCredsHandler,
} from "./handler.js";
import {
  validateEmailCredsRequestBody,
  validateSendEmailRequestBody,
  validateSendTestEmailRequestBody,
} from "./prehandler.js";

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
route.get("/creds", authenticate, getEmailCredsHandler);

route.get("/templates", authenticate, getEmailTemplatesHandler);

route.get("/list", authenticate, getEmailsListHandler);

route.post(
  "/test",
  authenticate,
  validateSendTestEmailRequestBody,
  sendTestEmailHandler,
);

route.get("/details/:emailId", authenticate, getEmailDetailsHandler);

export default route;
