import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
}));

import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

describe("Auth Login", () => {
  it("should login successfully with correct credentials", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    await User.create({
      fullName: "Login User",
      email: "login@test.com",
      password: hashedPassword,

      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@test.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("token");

    expect(response.body.email).toBe("login@test.com");
  });

  it("should reject invalid password", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    await User.create({
      fullName: "Wrong Password User",
      email: "wrongpass@test.com",
      password: hashedPassword,

      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrongpass@test.com",
        password: "wrongpassword",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should reject nonexistent email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "nouser@test.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should reject banned user", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    await User.create({
      fullName: "Banned User",
      email: "banned@test.com",
      password: hashedPassword,
      isBanned: true,

      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "banned@test.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(403);

    expect(response.body.message).toBe(
      "Your account has been banned"
    );
  });
});