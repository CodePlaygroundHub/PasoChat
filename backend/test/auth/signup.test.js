import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
}));

import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const { app } = await import("../../src/index.js");
const { default: User } = await import("../../src/models/user.model.js");
const { pubClient, subClient } = await import("../../src/lib/redis.js");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  await mongoServer.stop();

  await pubClient.quit();
  await subClient.quit();
});

afterEach(async () => {
  await User.deleteMany();
});

describe("Auth Signup", () => {
  it("should signup a new user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        fullName: "Test User",
        email: "test@example.com",
        password: "password123",

        securityQuestions: [
          {
            question: "Your pet?",
            answer: "dog",
          },
          {
            question: "Favorite color?",
            answer: "blue",
          },
          {
            question: "Birth city?",
            answer: "kolkata",
          },
        ],
      });

    expect(response.statusCode).toBe(201);

    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("token");

    expect(response.body.email).toBe("test@example.com");

    const userInDB = await User.findOne({
      email: "test@example.com",
    });

    expect(userInDB).not.toBeNull();
  });
});