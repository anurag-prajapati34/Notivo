import { authenticate, authenticateApiKey } from "@/middleware/auth";
import express from "express";
import { sendEmailHandler, setEmailCredsHandler } from "./handler";
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

export default route;
