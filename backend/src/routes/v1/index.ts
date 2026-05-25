import express from "express";
import email from "./email/index.ts";
const route = express.Router();

route.use("/email", email);

export default route;
