import { createClient } from "redis";

export let pubClient = null;
export let subClient = null;

const isTest = process.env.NODE_ENV === "test";

if (!isTest && process.env.REDIS_URL) {
  pubClient = createClient({
    url: process.env.REDIS_URL,
  });

  subClient = pubClient.duplicate();

  pubClient.on("error", (err) => {
    console.log("Redis Pub Error:", err.message);
  });

  subClient.on("error", (err) => {
    console.log("Redis Sub Error:", err.message);
  });

  try {
    await pubClient.connect();
    await subClient.connect();
    console.log("✅ Redis connected");
  } catch (error) {
    console.log("⚠️ Redis unavailable:", error.message);
  }
}