import { createClient } from "redis";
import { logger } from "../../shared/utils/logger";
import { env } from "../../shared/config/env";

export const redisClient = createClient({
  username: 'default',
  password: env.redisPassword,
  socket: {
    host: env.redisHost,
    port: env.redisPort,
  },
});

redisClient.on("connect", () => {
  logger.info("Redis connected");
});

redisClient.on("error", (err) => {
  logger.error("[ERROR]Redis error", err);
});

export async function initRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}
