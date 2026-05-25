import express from "express";
import { sendEmailHandler } from "./handler";

const route = express.Router();

route.post("/send", sendEmailHandler);

export default route;
