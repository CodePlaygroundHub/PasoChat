import {
  pubClient,
  subClient,
} from "../src/lib/redis.js";

export const cleanupRedis = async () => {
  if (pubClient.isOpen) {
    await pubClient.quit();
  }

  if (subClient.isOpen) {
    await subClient.quit();
  }
};