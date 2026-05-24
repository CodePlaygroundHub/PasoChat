import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
}));

import request from "supertest";

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

  it("should reject duplicate email", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({
        fullName: "First User",
        email: "duplicate@test.com",
        password: "password123",

        securityQuestions: [
          { question: "Q1", answer: "A1" },
          { question: "Q2", answer: "A2" },
          { question: "Q3", answer: "A3" },
        ],
      });

    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        fullName: "Second User",
        email: "duplicate@test.com",
        password: "password123",

        securityQuestions: [
          { question: "Q1", answer: "A1" },
          { question: "Q2", answer: "A2" },
          { question: "Q3", answer: "A3" },
        ],
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Email already exists"
    );
  });

  it("should reject short password", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        fullName: "Weak Password User",
        email: "weak@test.com",
        password: "123",

        securityQuestions: [
          { question: "Q1", answer: "A1" },
          { question: "Q2", answer: "A2" },
          { question: "Q3", answer: "A3" },
        ],
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Password must be at least 6 characters"
    );
  });

  it("should reject missing required fields", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "missing@test.com",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "All fields are required"
    );
  });

  it("should reject missing security questions", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        fullName: "No Security User",
        email: "nosecurity@test.com",
        password: "password123",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Exactly 3 security questions are required"
    );
  });
});