import { config } from "@/config";
import { NextFunction, Request, Response } from "express";
import { createLogger, format, transports } from "winston";

const logFormat = format.combine(
  format.errors({ stack: true }),
  format.colorize({ all: true }),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.sss" }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `[${level}] - [${timestamp}]: ${message}`;

    // Add any additional data/metadata
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  }),
);

export const logger = createLogger({
  level: config.nodeEnv === "development" ? "debug" : "info",
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp(),
    format.json(),
  ),
  transports: [
    new transports.Console({ format: logFormat }),
    // new transports.File({ filename: "error.log", level: "error" }),
  ],
});

export const apiRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      query: req.query,
      body: req.body,
    });
  });

  next();
};
