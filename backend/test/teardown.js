import { pubClient, subClient } from "../src/lib/redis.js";

/**
 * Cleanup Redis clients
 * Gracefully closes pub/sub connections
 * @returns {Promise<void>}
 */
export const cleanupRedis = async () => {
  try {
    if (pubClient && pubClient.isOpen) {
      await pubClient.quit();
    }
    if (subClient && subClient.isOpen) {
      await subClient.quit();
    }
  } catch (error) {
    console.error("Error cleaning up Redis:", error);
    // Don't throw - graceful shutdown
  }
};

/**
 * Cleanup all test resources
 * Call this in afterAll hooks
 * @returns {Promise<void>}
 */
export const cleanupAll = async () => {
  try {
    await cleanupRedis();
  } catch (error) {
    console.error("Error in cleanupAll:", error);
  }
};