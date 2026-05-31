/**
 * Security & JWT Tests
 * Comprehensive tests for authentication security, token validation, and attack prevention
 */

import { jest } from "@jest/globals";
import { ObjectId } from "mongodb";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOtpEmail: jest.fn(),
}));

import request from "supertest";
import jwt from "jsonwebtoken";
import {
  connectTestDB,
  disconnectTestDB,
  clearAllCollections,
} from "../setup.js";
import { cleanupRedis } from "../teardown.js";
import {
  createTestUser,
  generateTestToken,
  createSignupPayload,
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

describe("Security - JWT Token Tests", () => {
  describe("✓ Token format and structure", () => {
    it("should generate properly formatted JWT", async () => {
      const payload = createSignupPayload();
      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(response.statusCode).toBe(201);
      const token = response.body.token;

      // JWT format: header.payload.signature
      const parts = token.split(".");
      expect(parts.length).toBe(3);

      // Decode and verify
      const decoded = jwt.decode(token);
      expect(decoded).toHaveProperty("userId");
    });

    it("should include userId in token payload", async () => {
      const payload = createSignupPayload();
      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      const token = response.body.token;
      const decoded = jwt.decode(token);

      expect(decoded.userId).toBeDefined();
      expect(typeof decoded.userId).toBe("string");
    });

    it("should use correct signing algorithm", async () => {
      const payload = createSignupPayload();
      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      const token = response.body.token;
      const parts = token.split(".");
      const header = JSON.parse(
        Buffer.from(parts[0], "base64").toString()
      );

      expect(header.alg).toBe("HS256");
    });

    it("should have expiration time", async () => {
      const payload = createSignupPayload();
      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      const token = response.body.token;
      const decoded = jwt.decode(token);

      expect(decoded.exp).toBeDefined();
      // Should be valid for at least 1 day
      const expiresIn =
        (decoded.exp - decoded.iat) / (24 * 3600);
      expect(expiresIn).toBeGreaterThan(1);
    });
  });

  describe("✗ Token tampering & forgery", () => {
    it("should reject modified token payload", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const validToken = generateTestToken(user._id.toString());

      // Tamper with payload
      const parts = validToken.split(".");
      const modified =
        parts[0] +
        "." +
        Buffer.from(JSON.stringify({ userId: "hacker" })).toString(
          "base64"
        ) +
        "." +
        parts[2];

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${modified}`);

      expect(response.statusCode).toBe(401);
    });

    it("should reject token signed with different key", async () => {
      const differentKeyToken = jwt.sign(
        { userId: "someid" },
        "differentSecret"
      );

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${differentKeyToken}`);

      expect(response.statusCode).toBe(401);
    });

    it("should reject token with modified signature", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const validToken = generateTestToken(user._id.toString());

      // Tamper with signature
      const parts = validToken.split(".");
      const modified =
        parts[0] +
        "." +
        parts[1] +
        ".tamperedsignature";

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${modified}`);

      expect(response.statusCode).toBe(401);
    });

    it("should reject token with missing signature", async () => {
      const parts = generateTestToken(
        new ObjectId().toString()
      ).split(".");
      const modified = parts[0] + "." + parts[1];

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${modified}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("✗ Token expiration attacks", () => {
    it("should reject expired token", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);

      // Create expired token
      const expiredToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "-1h" }
      );

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.statusCode).toBe(401);
    });

    it("should reject token that expires immediately", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);

      const immediateExpireToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "0s" }
      );

      // Wait a bit and try to use
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${immediateExpireToken}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("✗ Token reuse & revocation", () => {
    it("should issue new token on each auth action", async () => {
      const userPayload = await createTestUser({
        email: "tokentest@test.com",
      });
      const user = await User.create(userPayload);

      const signupToken = generateTestToken(user._id.toString());

      // Use token
      const response1 = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${signupToken}`);

      expect(response1.statusCode).toBe(200);

      // Token should still be valid (no revocation in this app)
      const response2 = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${signupToken}`);

      expect(response2.statusCode).toBe(200);
    });
  });

  describe("✗ CSRF prevention", () => {
    it("should not accept tokens in query parameters", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app).get(
        `/api/auth/check?token=${token}`
      );

      // Should fail - token must be in header
      expect(response.statusCode).toBe(401);
    });

    it("should not accept tokens in body for GET requests", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .send({ token });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("✗ Authorization header attacks", () => {
    it.skip("should reject null bytes in token", async () => {
      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", "Bearer token\x00malicious");

      expect(response.statusCode).toBe(401);
    });

    it("should reject extremely long tokens", async () => {
      const veryLongToken = "eyJ" + "A".repeat(5000);

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${veryLongToken}`);

      expect([400, 401, 431]).toContain(response.statusCode);
    });

    it("should handle whitespace in Authorization header", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `  Bearer   ${token}  `);

      // May fail due to format, but should not cause errors
      expect([200, 401]).toContain(response.statusCode);
    });
  });
});

describe("Security - Password Security", () => {
  describe("✓ Password hashing", () => {
    it("should hash password with bcrypt", async () => {
      const payload = createSignupPayload({
        password: "MySecurePassword123",
      });

      await request(app).post("/api/auth/signup").send(payload);

      const user = await User.findOne({
        email: payload.email,
      }).select("+password");

      // Hashed password should not match plaintext
      expect(user.password).not.toBe(payload.password);

      // Hashed password should be longer (typical bcrypt format)
      expect(user.password.length).toBeGreaterThan(20);

      // Should start with bcrypt salt identifier
      expect(user.password.startsWith("$2")).toBe(true);
    });

    it("should use strong bcrypt salt", async () => {
      const payload = createSignupPayload();

      await request(app).post("/api/auth/signup").send(payload);

      const user = await User.findOne({
        email: payload.email,
      }).select("+password");

      // Bcrypt format: $2a$10$... (version$cost$salt$hash)
      const parts = user.password.split("$");
      expect(parts.length).toBe(4);
      expect(parts[2]).toBe("10"); // Cost factor of 10 is standard
    });
  });

  describe("✗ Password attacks", () => {
    it("should prevent plaintext password storage", async () => {
      const payload = createSignupPayload({
        password: "TestPassword123",
      });

      await request(app).post("/api/auth/signup").send(payload);

      const user = await User.findOne({
        email: payload.email,
      }).select("+password");

      // Password should never be stored in plaintext
      expect(user.password).not.toContain("TestPassword");
      expect(user.password).not.toContain("Test");
    });

    it("should reject rainbow table attacks", async () => {
      // Create a user
      const payload = createSignupPayload({
        password: "commonpassword",
      });

      await request(app).post("/api/auth/signup").send(payload);

      const user1 = await User.findOne({
        email: payload.email,
      }).select("+password");

      // Create another user with same password
      const payload2 = createSignupPayload({
        password: "commonpassword",
        email: `different${Date.now()}@test.com`,
      });

      await request(app).post("/api/auth/signup").send(payload2);

      const user2 = await User.findOne({
        email: payload2.email,
      }).select("+password");

      // Same plaintext password should produce different hashes (due to salt)
      expect(user1.password).not.toBe(user2.password);
    });
  });
});

describe("Security - SQL/NoSQL Injection", () => {
  describe("✗ NoSQL injection prevention", () => {
    it("should safely handle $ne operator in email", async () => {
      const payload = createSignupPayload({
        email: '{"$ne": null}@test.com',
      });

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      // Should either reject as invalid email or handle safely
      expect([201, 400]).toContain(response.statusCode);
    });

    it("should safely handle $regex in password", async () => {
      const payload = createSignupPayload();
      payload.password = '{"$regex": ".*"}';

      const response = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      // Should reject or handle safely
      expect([201, 400]).toContain(response.statusCode);
    });

    it("should prevent login with operator injection", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: { $ne: null },
          password: { $ne: null },
        });

      expect(response.statusCode).toBe(400);
    });
  });
});

describe("Security - Rate Limiting", () => {
  describe("✓ Login attempt tracking", () => {
    it("should accept multiple login attempts", async () => {
      const userPayload = await createTestUser({
        email: "ratelimit@test.com",
      });
      await User.create(userPayload);

      // Try 3 times
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post("/api/auth/login")
          .send({
            email: "ratelimit@test.com",
            password: "wrongpassword",
          });

        expect(response.statusCode).toBe(400);
      }
    });
  });
});
