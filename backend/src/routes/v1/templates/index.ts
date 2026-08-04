import {
  createTemplateHandler,
  deleteTemplateHandler,
  getTemplateByIdHandler,
  getTemplatesHandler,
  updateTemplateHandler,
} from "./handler.js";
import { authenticate } from "@/middleware/auth.js";
import express from "express";

const router = express.Router();

router.get("/", authenticate, getTemplatesHandler);
router.get("/:templateId", authenticate, getTemplateByIdHandler);
router.post("/", authenticate, createTemplateHandler);
router.put("/:templateId", authenticate, updateTemplateHandler);
router.delete("/:templateId", authenticate, deleteTemplateHandler);

export default router;
