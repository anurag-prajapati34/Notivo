import express from "express";
import auth from "./auth/index.js";
import email from "./email/index.js";
import analytics from "./analytics/index.js";
const route = express.Router();

route.use("/auth", auth);
route.use("/email", email);
route.use("/analytics", analytics);

export default route;
