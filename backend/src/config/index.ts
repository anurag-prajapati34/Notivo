import z from "zod";
import dotenv from "dotenv";
dotenv.config();
const configSchema = z.object({
  nodeEnv: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number),
  DB: z.object({
    HOST: z.string(),
    USER: z.string(),
    PASSWORD: z.string(),
    DATABASE: z.string(),
    PORT: z.string().transform(Number),
  }),
  redis: z.object({
    host: z.string(),
    port: z.string().transform(Number),
    password: z.string().optional(),
  }),
  email: z.object({
    from: z.string(),
    host: z.string(),
    port: z.string().transform(Number),
    secure: z.boolean(),
    auth: z.object({
      user: z.string(),
      pass: z.string(),
    }),
  }),
  encryptionKey: z.string(),
  jwt: z.object({
    secret: z.string(),
    expiresIn: z.union([
      z.enum([
        "1s",
        "5s",
        "10s",
        "15s",
        "30s",
        "1m",
        "5m",
        "10m",
        "15m",
        "30m",
        "1h",
        "2h",
        "6h",
        "12h",
        "24h",
        "1d",
        "2d",
        "7d",
        "14d",
        "30d",
      ]),
      z.number().positive(),
    ]),
  }),
});

const config = configSchema.parse({
  nodeEnv: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB: {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USERNAME,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DB_NAME,
    PORT: process.env.DB_PORT,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  },
  email: {
    from: process.env.SMTP_FROM,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  encryptionKey: process.env.ENCRYPTION_KEY,
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});

export { config };
