import { authenticate } from "@/middleware/auth";
import express from "express";
import { getAnalyticsStatsHandler } from "./handler";
const route = express.Router();

route.get("/stats", authenticate, getAnalyticsStatsHandler);

export default route;
