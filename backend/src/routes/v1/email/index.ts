import express from "express";
import { sendEmailHandler } from "./handler";
import { authenticateApiKey } from "@/middleware/auth";

const route = express.Router();

// send email route
route.post("/send", authenticateApiKey, sendEmailHandler);

export default route;
