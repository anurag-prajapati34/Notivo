import { config } from "@/config";
import { createLogger, format, transports } from "winston";
export const logger = createLogger({
  level: config.nodeEnv === "development" ? "debug" : "info",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json(),
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: "error.log",
      level: "error",
    }),
  ],
});
