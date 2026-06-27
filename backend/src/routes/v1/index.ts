import express from "express";
import auth from "./auth/index.ts";
import email from "./email/index.ts";
import analytics from "./analytics/index.ts";
const route = express.Router();

route.use("/auth", auth);
route.use("/email", email);
route.use("/analytics", analytics);

export default route;
