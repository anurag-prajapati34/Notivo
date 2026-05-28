import express from "express";
import auth from "./auth/index.ts";
import email from "./email/index.ts";
const route = express.Router();

route.use("/auth", auth);
route.use("/email", email);

export default route;
