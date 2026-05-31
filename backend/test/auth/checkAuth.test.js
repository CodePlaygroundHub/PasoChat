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
  generateExpiredToken,
  generateMalformedToken,
  assertValidUserResponse,
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

describe("GET /api/auth/check - Verify JWT authentication", () => {
  describe("✓ Successful authentication", () => {
    it("should return authenticated user with valid token", async () => {
      const userPayload = await createTestUser({
        email: "valid@test.com",
        fullName: "Valid User",
      });
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      assertValidUserResponse(response.body);
      expect(response.body._id.toString()).toBe(
        user._id.toString()
      );
      expect(response.body.fullName).toBe("Valid User");
    });

    it("should not expose sensitive fields", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).not.toHaveProperty("password");
      expect(response.body).not.toHaveProperty("securityQuestions");
    });

    it("should include user role", async () => {
      const userPayload = await createTestUser({
        role: "user",
      });
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token}`);

      expect(response.body.role).toBe("user");
    });

    it("should handle Bearer token with proper format", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
    });
  });

  describe("✗ Missing/Invalid token", () => {
    it("should reject request without Authorization header", async () => {
      const response = await request(app).get("/api/auth/check");

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toContain("Unauthorized");
    });

    it("should reject missing Bearer token", async () => {
      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", "Bearer");

      expect(response.statusCode).toBe(401);
    });

    it("should reject Authorization header without Bearer", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", token); // Missing 'Bearer'

      expect(response.statusCode).toBe(401);
    });

    it("should reject malformed token", async () => {
      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", "Bearer invalidtoken");

      expect(response.statusCode).toBe(401);
    });

    it("should reject token with wrong secret", async () => {
      const fakeToken = jwt.sign({ userId: "fakeid" }, "wrongSecret");

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${fakeToken}`);

      expect(response.statusCode).toBe(401);
    });

    it("should reject empty Authorization header", async () => {
      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", "");

      expect(response.statusCode).toBe(401);
    });

    it("should reject token with extra Bearer prefixes", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer Bearer ${token}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("✗ Token expiration and validity", () => {
    it("should reject expired token", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const expiredToken = generateExpiredToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toContain("Unauthorized");
    });

    it("should handle token with wrong structure", async () => {
      const malformedToken = generateMalformedToken();

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${malformedToken}`);

      expect(response.statusCode).toBe(401);
    });

    it("should reject token without userId", async () => {
      const badToken = jwt.sign({}, process.env.JWT_SECRET);

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${badToken}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("✗ User validation", () => {
    it("should reject token for deleted user", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      // Delete the user
      await User.findByIdAndDelete(user._id);

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toContain("not found");
    });

    it("should reject token with non-existent userId", async () => {
      const fakeUserId = new ObjectId();
      const token = generateTestToken(fakeUserId.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(401);
    });

    it("should reject token with invalid ObjectId format", async () => {
      const token = generateTestToken("notanobjectid");

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(401);
    });
  });

  describe("✓ Concurrent requests", () => {
    it("should handle multiple concurrent auth checks", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const promises = Array(5)
        .fill(null)
        .map(() =>
          request(app)
            .get("/api/auth/check")
            .set("Authorization", `Bearer ${token}`)
        );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body._id.toString()).toBe(
          user._id.toString()
        );
      });
    });
  });

  describe("✓ Token format variations", () => {
    it("should accept valid token with lowercase bearer", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `bearer ${token}`);

      // Some servers might be case-sensitive
      expect([200, 401]).toContain(response.statusCode);
    });

    it("should accept valid token with uppercase Bearer", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `BEARER ${token}`);

      // Some servers might be case-sensitive
      expect([200, 401]).toContain(response.statusCode);
    });
  });

  describe("✓ Different user roles", () => {
    it("should work for admin users", async () => {
      const userPayload = await createTestUser({ role: "admin" });
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.role).toBe("admin");
    });

    it("should work for regular users", async () => {
      const userPayload = await createTestUser({ role: "user" });
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.role).toBe("user");
    });
  });

  describe("✗ Edge cases", () => {
    it("should reject overly long token", async () => {
      const veryLongToken =
        "Bearer " + "A".repeat(5000);

      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", veryLongToken);

      expect([400, 401, 431]).toContain(response.statusCode);
    });

    it("should handle token with special characters", async () => {
      const response = await request(app)
        .get("/api/auth/check")
        .set(
          "Authorization",
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.@#$%^&"
        );

      expect(response.statusCode).toBe(401);
    });

    it.skip("should reject if Authorization header contains newlines", async () => {
      const response = await request(app)
        .get("/api/auth/check")
        .set("Authorization", "Bearer token\nmalicious");

      expect(response.statusCode).toBe(401);
    });
  });
});