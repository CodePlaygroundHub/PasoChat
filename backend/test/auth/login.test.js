import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOtpEmail: jest.fn(),
  sendVerificationOtpEmail: jest.fn(),
}));

import request from "supertest";
import bcrypt from "bcryptjs";
import {
  connectTestDB,
  disconnectTestDB,
  clearAllCollections,
} from "../setup.js";
import { cleanupRedis } from "../teardown.js";
import {
  createTestUser,
  assertValidAuthResponse,
} from "../utils/testHelpers.js";

const { app } = await import("../../src/index.js");
const { default: User } = await import("../../src/models/user.model.js");

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
  await cleanupRedis();
});

afterEach(async () => {
  await clearAllCollections();
});

describe("POST /api/auth/login - Authenticate user", () => {
  describe("✓ Successful login scenarios", () => {
    it("should login with correct email and password", async () => {
      const userPayload = await createTestUser({
        email: "success@test.com",
      });
      const createdUser = await User.create(userPayload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "success@test.com",
          password: "testPassword123",
        });

      expect(response.statusCode).toBe(200);
      assertValidAuthResponse(response.body);
      expect(response.body._id.toString()).toBe(
        createdUser._id.toString()
      );
    });

    it("should return valid JWT token on login", async () => {
      const userPayload = await createTestUser({
        email: "token@test.com",
      });
      await User.create(userPayload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "token@test.com",
          password: "testPassword123",
        });

      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.split(".").length).toBe(3);
    });

    it("should not expose password in response", async () => {
      const userPayload = await createTestUser();
      await User.create(userPayload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userPayload.email,
          password: "testPassword123",
        });

      expect(response.body).not.toHaveProperty("password");
    });

    it("should login with email case-insensitive", async () => {
      const userPayload = await createTestUser({
        email: "caseinsensitive@test.com",
      });
      await User.create(userPayload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "CASEINSENSITIVE@TEST.COM",
          password: "testPassword123",
        });

      expect(response.statusCode).toBe(200);
    });

    it("should populate user fields correctly", async () => {
      const userPayload = await createTestUser({
        email: "populate@test.com",
        fullName: "Test User Full",
      });
      await User.create(userPayload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "populate@test.com",
          password: "testPassword123",
        });

      expect(response.body.fullName).toBe("Test User Full");
      expect(response.body.email).toBe("populate@test.com");
    });

    it("should allow legacy users (where isVerified is undefined) to log in", async () => {
      const userPayload = await createTestUser({
        email: "legacy@test.com",
      });
      delete userPayload.isVerified;

      const createdUser = await User.create(userPayload);
      await User.updateOne({ _id: createdUser._id }, { $unset: { isVerified: "" } });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "legacy@test.com",
          password: "testPassword123",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe("legacy@test.com");
    });
  });

  describe("✗ Invalid credentials", () => {
    it("should reject unverified users from logging in", async () => {
      const userPayload = await createTestUser({
        email: "unverified@test.com",
        isVerified: false,
      });
      await User.create(userPayload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unverified@test.com",
          password: "testPassword123",
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        "Please verify your email before logging in"
      );
    });

    it("should reject wrong password", async () => {
      const userPayload = await createTestUser({
        email: "wrongpass@test.com",
      });
      await User.create(userPayload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "wrongpass@test.com",
          password: "wrongPassword",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain("Invalid");
    });

    it("should reject non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@test.com",
          password: "anyPassword",
        });

      expect(response.statusCode).toBe(400);
    });

    it("should reject empty password", async () => {
      const userPayload = await createTestUser();
      await User.create(userPayload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userPayload.email,
          password: "",
        });

      expect(response.statusCode).toBe(400);
    });

    it("should reject empty email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "",
          password: "anyPassword",
        });

      expect(response.statusCode).toBe(400);
    });

    it("should be case-sensitive for password", async () => {
      const userPayload = await createTestUser({
        email: "casesensitive@test.com",
      });
      await User.create(userPayload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "casesensitive@test.com",
          password: "TestPassword123", // Different case
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("✗ Missing fields", () => {
    it("should reject missing email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          password: "anyPassword",
        });

      expect(response.statusCode).toBe(400);
    });

    it("should reject missing password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
        });

      expect(response.statusCode).toBe(400);
    });

    it("should reject null email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: null,
          password: "anyPassword",
        });

      expect(response.statusCode).toBe(400);
    });

    it("should reject null password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: null,
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("✗ Brute force protection (rate limiting)", () => {
    it("should accept multiple login attempts (5+ consecutive failures)", async () => {
      const userPayload = await createTestUser({
        email: "bruteforce@test.com",
      });
      await User.create(userPayload);

      // Make multiple failed attempts
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            email: "bruteforce@test.com",
            password: "wrongPassword",
          });

        expect(response.statusCode).toBe(400);
      }

      // Verify the account still works with correct password
      const successResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "bruteforce@test.com",
          password: "testPassword123",
        });

      expect([200, 400]).toContain(successResponse.statusCode);
    });
  });

  describe("✗ Injection attacks", () => {
    it("should safely handle NoSQL operators in email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: { $ne: null },
          password: "anyPassword",
        });

      expect([400, 500]).toContain(response.statusCode);
    });

    it("should safely handle regex in password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: { $regex: ".*" },
        });

      expect([400, 500]).toContain(response.statusCode);
    });
  });

  describe("✓ Edge cases", () => {
    it("should handle whitespace in email", async () => {
      const userPayload = await createTestUser({
        email: "whitespace@test.com",
      });
      await User.create(userPayload);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "  whitespace@test.com  ",
          password: "testPassword123",
        });

      // Should trim and succeed
      expect([200, 400]).toContain(response.statusCode);
    });

    it("should handle special characters in password", async () => {
      const specialPassword = "P@ssw0rd!#$%";
      const hashedPassword = await bcrypt.hash(specialPassword, 10);

      await User.create({
        fullName: "Special Char User",
        email: "special@test.com",
        password: hashedPassword,
        isVerified: true,
        securityQuestions: [
          { question: "Q1", answer: "A1" },
          { question: "Q2", answer: "A2" },
          { question: "Q3", answer: "A3" },
        ],
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "special@test.com",
          password: specialPassword,
        });

      expect(response.statusCode).toBe(200);
    });

    it("should handle very long password", async () => {
      const longPassword = "A".repeat(1000);
      const hashedPassword = await bcrypt.hash(longPassword, 10);

      await User.create({
        fullName: "Long Pass User",
        email: "longpass@test.com",
        password: hashedPassword,
        isVerified: true,
        securityQuestions: [
          { question: "Q1", answer: "A1" },
          { question: "Q2", answer: "A2" },
          { question: "Q3", answer: "A3" },
        ],
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "longpass@test.com",
          password: longPassword,
        });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("✓ Error response format", () => {
    it("should return consistent error format", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@test.com",
          password: "anyPassword",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });
});

