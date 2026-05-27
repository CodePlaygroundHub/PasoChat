import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOtpEmail: jest.fn(),
}));

import request from "supertest";
import jwt from "jsonwebtoken";

import {
  connectTestDB,
  disconnectTestDB,
} from "../setup.js";

import { cleanupRedis } from "../teardown.js";

const { app } = await import("../../src/index.js");

const { default: User } = await import(
  "../../src/models/user.model.js"
);

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();

  await cleanupRedis();
});

afterEach(async () => {
  await User.deleteMany();
});

describe("Check Auth", () => {
  it("should return authenticated user with valid token", async () => {
    const user = await User.create({
      fullName: "Protected User",
      email: "protected@test.com",
      password: "password123",

      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET
    );

    const response = await request(app)
      .get("/api/auth/check")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.email).toBe(
      "protected@test.com"
    );
  });

  it("should reject request without token", async () => {
    const response = await request(app)
      .get("/api/auth/check");

    expect(response.statusCode).toBe(401);
  });

  it("should reject invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/check")
      .set(
        "Authorization",
        "Bearer invalidtoken"
      );

    expect(response.statusCode).toBe(401);
  });
});