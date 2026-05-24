process.env.NODE_ENV = "test";

process.env.JWT_SECRET = "testsecret";

process.env.GROQ_API_KEY = "fake-groq-key";

process.env.REDIS_URL = "redis://localhost:6379";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

export const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
};

export const disconnectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();

    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
};