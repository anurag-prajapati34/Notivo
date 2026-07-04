import { authenticate } from "@/middleware/auth.js";
import express from "express";
import { getAnalyticsStatsHandler } from "./handler.js";
const route = express.Router();

route.get("/stats", authenticate, getAnalyticsStatsHandler);

export default route;
