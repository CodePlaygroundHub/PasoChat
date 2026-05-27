process.env.NODE_ENV = "test";

process.env.JWT_SECRET = "test-jwt-secret-key-do-not-use-in-production";

process.env.GROQ_API_KEY = "gsk_test_key";

process.env.REDIS_URL = "redis://localhost:6379";

process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key";
process.env.CLOUDINARY_API_SECRET = "test-secret";

process.env.MAIL_HOST = "smtp.test.com";
process.env.MAIL_PORT = "587";
process.env.MAIL_USER = "test@test.com";
process.env.MAIL_PASS = "test-password";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

/**
 * Connect to the in-memory MongoDB instance
 * @returns {Promise<void>}
 */
export const connectTestDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (error) {
    console.error("Error connecting to test DB:", error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB and stop the in-memory server
 * @returns {Promise<void>}
 */
export const disconnectTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error("Error disconnecting from test DB:", error);
    throw error;
  }
};

/**
 * Clear all collections in the database
 * @returns {Promise<void>}
 */
export const clearAllCollections = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error("Error clearing collections:", error);
    throw error;
  }
};