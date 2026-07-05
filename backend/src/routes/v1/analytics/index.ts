import { authenticate } from "@/middleware/auth.js";
import express from "express";
import { getAnalyticsStatsHandler, seedDemoDataHandler } from "./handler.js";
const route = express.Router();

route.get("/stats", authenticate, getAnalyticsStatsHandler);
route.put("/seed-demo-data", authenticate, seedDemoDataHandler);

export default route;
