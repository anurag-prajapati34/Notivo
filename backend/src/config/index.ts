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
});

export { config };
