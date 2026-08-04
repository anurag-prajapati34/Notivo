import express from "express";
import analytics from "./analytics/index.js";
import auth from "./auth/index.js";
import email from "./email/index.js";
import templates from "./templates/index.js";

const route = express.Router();

route.use("/auth", auth);
route.use("/email", email);
route.use("/analytics", analytics);
route.use("/templates", templates);

export default route;
