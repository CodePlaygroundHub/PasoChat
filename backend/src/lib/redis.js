import { createClient } from "redis";

export const pubClient = createClient({
  url: process.env.REDIS_URL,
});

export const subClient = pubClient.duplicate();

pubClient.on("error", (err) => {
  console.log("Redis Pub Error:", err);
});

subClient.on("error", (err) => {
  console.log("Redis Sub Error:", err);
});

// await pubClient.connect();
// await subClient.connect();

console.log("✅ Redis connected");