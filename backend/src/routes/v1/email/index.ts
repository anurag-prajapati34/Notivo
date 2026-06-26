import { authenticate, authenticateApiKey } from "@/middleware/auth";
import express from "express";
import {
  getEmailTemplatesHandler,
  sendEmailHandler,
  setEmailCredsHandler,
} from "./handler";
import { validateEmailCredsRequestBody } from "./prehandler";

const route = express.Router();

// send email route
route.post("/send", authenticateApiKey, sendEmailHandler);
route.post(
  "/creds",
  authenticate,
  validateEmailCredsRequestBody,
  setEmailCredsHandler,
);

route.get("/templates", authenticate, getEmailTemplatesHandler);

export default route;
