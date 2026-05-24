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
});

export { config };
