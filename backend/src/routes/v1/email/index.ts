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
  validateGetEmailCredsQuery,
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

//Set email creds
route.post(
  "/creds",
  authenticate,
  validateEmailCredsRequestBody,
  setEmailCredsHandler,
);

//Get email creds
route.get(
  "/creds",
  authenticate,
  validateGetEmailCredsQuery,
  getEmailCredsHandler,
);
//Get email templates
route.get("/templates", authenticate, getEmailTemplatesHandler);
//Get email list
route.get("/list", authenticate, getEmailsListHandler);

//Send test email
route.post(
  "/test",
  authenticate,
  validateSendTestEmailRequestBody,
  sendTestEmailHandler,
);

//Get email details
route.get("/details/:emailId", authenticate, getEmailDetailsHandler);

export default route;
