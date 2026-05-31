import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOtpEmail: jest.fn(),
}));

import request from "supertest";
import {
  connectTestDB,
  disconnectTestDB,
  clearAllCollections,
} from "../setup.js";
import { cleanupRedis } from "../teardown.js";
import {
  createSignupPayload,
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

describe("POST /api/auth/signup - Create new user account", () => {
  describe("✓ Successful signup scenarios", () => {
    it("should create new user with all required fields", async () => {
      const payload = createSignupPayload();

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(201);
      assertValidAuthResponse(response.body);
      expect(response.body.email).toBe(payload.email.toLowerCase());

      const userInDB = await User.findOne({ email: payload.email });
      expect(userInDB).not.toBeNull();
      expect(userInDB.fullName).toBe(payload.fullName);
    });

    it("should generate valid JWT token on signup", async () => {
      const payload = createSignupPayload();
      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.split(".").length).toBe(3); // JWT format check
    });

    it("should hash password securely", async () => {
      const payload = createSignupPayload();
      await request(app).post("/api/auth/signup").send(payload);

      const userInDB = await User.findOne({ email: payload.email }).select(
        "+password"
      );
      expect(userInDB.password).not.toBe(payload.password);
      expect(userInDB.password.length).toBeGreaterThan(10); // Hashed password is longer
    });

    it("should hash security answers", async () => {
      const payload = createSignupPayload();
      await request(app).post("/api/auth/signup").send(payload);

      const userInDB = await User.findOne({ email: payload.email });
      expect(userInDB.securityQuestions).toBeDefined();
      expect(userInDB.securityQuestions.length).toBe(3);

      // Answers should not be plaintext
      userInDB.securityQuestions.forEach((sq) => {
        expect(sq.answer).not.toBe(payload.securityQuestions[0].answer);
      });
    });

    it("should normalize email to lowercase", async () => {
      const payload = createSignupPayload({
        email: "Test@EXAMPLE.COM",
      });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.body.email).toBe("test@example.com");
    });

    it("should set default role as 'user'", async () => {
      const payload = createSignupPayload();
      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.body.role).toBe("user");
    });

    it("should not expose password in response", async () => {
      const payload = createSignupPayload();
      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.body).not.toHaveProperty("password");
    });

    it("should not expose security questions in response", async () => {
      const payload = createSignupPayload();
      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.body).not.toHaveProperty("securityQuestions");
    });
  });

  describe("✗ Validation failures", () => {
    it("should reject missing fullName", async () => {
      const payload = createSignupPayload();
      delete payload.fullName;

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain("required");
    });

    it("should reject missing email", async () => {
      const payload = createSignupPayload();
      delete payload.email;

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain("required");
    });

    it("should reject missing password", async () => {
      const payload = createSignupPayload();
      delete payload.password;

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain("required");
    });

    it("should reject missing security questions", async () => {
      const payload = createSignupPayload();
      delete payload.securityQuestions;

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain("security questions");
    });

    it("should reject wrong number of security questions", async () => {
      const payload = createSignupPayload();
      payload.securityQuestions = [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
      ];

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain("3");
    });

    it("should reject password shorter than 6 characters", async () => {
      const payload = createSignupPayload({ password: "12345" });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain("6");
    });

    it("should reject empty string password", async () => {
      const payload = createSignupPayload({ password: "" });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
    });

    it("should reject empty fullName", async () => {
      const payload = createSignupPayload({ fullName: "" });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
    });

    it("should reject empty email", async () => {
      const payload = createSignupPayload({ email: "" });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("✗ Duplicate email prevention", () => {
    it("should reject duplicate email (case-insensitive)", async () => {
      const email = "unique@test.com";
      const payload1 = createSignupPayload({ email });

      await request(app).post("/api/auth/signup").send(payload1);

      const payload2 = createSignupPayload({
        email: email.toUpperCase(),
      });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload2);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain("already exists");
    });

    it("should reject duplicate email with whitespace", async () => {
      const email = "test@test.com";
      const payload1 = createSignupPayload({ email });

      await request(app).post("/api/auth/signup").send(payload1);

      const payload2 = createSignupPayload({
        email: `  ${email}  `,
      });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload2);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("✗ Invalid input handling", () => {
    it("should handle malformed JSON gracefully", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send("invalid json");

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("should reject null values for required fields", async () => {
      const payload = createSignupPayload();
      payload.email = null;

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
    });

    it("should reject undefined values for required fields", async () => {
      const payload = {
        fullName: "Test",
        email: undefined,
        password: "test123",
        securityQuestions: [],
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(400);
    });

    it("should trim whitespace from fullName", async () => {
      const payload = createSignupPayload({
        fullName: "  John Doe  ",
      });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(201);
      // Verify trimming in DB
      const user = await User.findById(response.body._id);
      expect(user.fullName).toBe("John Doe");
    });

    it("should handle extremely long strings", async () => {
      const payload = createSignupPayload({
        fullName: "A".repeat(10000),
      });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      // Should either accept or reject gracefully
      expect([201, 400, 413]).toContain(response.statusCode);
    });
  });

  describe("✗ SQL/NoSQL Injection prevention", () => {
    it("should safely handle email with special characters", async () => {
      const payload = createSignupPayload({
        email: 'test"; DROP TABLE users; --@test.com',
      });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      // Should either reject as invalid email or handle safely
      expect([400, 201]).toContain(response.statusCode);
    });

    it("should safely handle MongoDB query operators in fullName", async () => {
      const payload = createSignupPayload({
        fullName: '{"$ne": null}',
      });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(201);
      const user = await User.findById(response.body._id);
      expect(user.fullName).toBe('{"$ne": null}');
    });
  });

  describe("✗ Email format validation", () => {
    it("should reject invalid email format", async () => {
      const invalidEmails = ["notanemail", "missing@domain", "@domain.com"];

      for (const invalidEmail of invalidEmails) {
        const payload = createSignupPayload({ email: invalidEmail });
        const response = await request(app)
          .post("/api/auth/signup")
          .send(payload);

        expect(response.statusCode).toBeGreaterThanOrEqual(400);
      }
    });

    it("should accept valid email formats", async () => {
      const validEmails = [
        "user@example.com",
        "user+tag@example.co.uk",
        "user.name@example.com",
      ];

      for (const validEmail of validEmails) {
        const payload = createSignupPayload({ email: validEmail });
        const response = await request(app)
          .post("/api/auth/signup")
          .send(payload);

        expect(response.statusCode).toBe(201);
      }
    });
  });

  describe("✓ Database integrity", () => {
    it("should create user with consistent data", async () => {
      const payload = createSignupPayload();
      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      const userInDB = await User.findById(response.body._id);
      expect(userInDB.email).toBe(payload.email.toLowerCase());
      expect(userInDB.fullName).toBe(payload.fullName);
    });

    it("should not create user if email is already taken", async () => {
      const payload1 = createSignupPayload({
        email: "taken@test.com",
      });

      await request(app).post("/api/auth/signup").send(payload1);

      const userCountBefore = await User.countDocuments();

      const payload2 = createSignupPayload({
        email: "taken@test.com",
      });

      await request(app).post("/api/auth/signup").send(payload2);

      const userCountAfter = await User.countDocuments();
      expect(userCountBefore).toBe(userCountAfter);
    });
  });
});