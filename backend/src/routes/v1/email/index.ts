import express from "express";
import { sendEmailHandler } from "./handler";

const route = express.Router();

// send email route
route.post("/send", sendEmailHandler);

export default route;
