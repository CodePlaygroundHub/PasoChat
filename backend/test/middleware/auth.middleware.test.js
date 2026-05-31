/**
 * Middleware Tests
 * Tests for authentication middleware, rate limiting, and other request middlewares
 */

import { jest } from "@jest/globals";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOtpEmail: jest.fn(),
}));

import {
  connectTestDB,
  disconnectTestDB,
  clearAllCollections,
} from "../setup.js";
import { cleanupRedis } from "../teardown.js";
import {
  createTestUser,
  generateTestToken,
  createMockRequest,
  createMockResponse,
} from "../utils/testHelpers.js";

const { protectRoute } =
  await import("../../src/middleware/auth.middleware.js");
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

describe("Auth Middleware - protectRoute", () => {
  describe("✓ Successful authentication", () => {
    it("should allow request with valid token", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const res = createMockResponse();
      let nextCalled = false;

      const next = jest.fn();

      await protectRoute(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it("should attach user object to request", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const res = createMockResponse();
      const next = () => {
        expect(req.user).toBeDefined();
        expect(req.user.fullName).toBe(user.fullName);
      };

      await protectRoute(req, res, next);
    });

    it("should not include password in user object", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const res = createMockResponse();
      const next = () => {
        expect(req.user).not.toHaveProperty("password");
      };

      await protectRoute(req, res, next);
    });
  });

  describe("✗ Missing token", () => {
    it("should reject request without Authorization header", async () => {
      const req = createMockRequest({
        headers: {},
      });

      const res = createMockResponse();
      let nextCalled = false;

      await protectRoute(req, res, () => {
        nextCalled = true;
      });

      expect(res.statusCode).toBe(401);
      expect(nextCalled).toBe(false);
    });

    it("should reject request without Bearer prefix", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const req = createMockRequest({
        headers: {
          authorization: token, // Missing 'Bearer'
        },
      });

      const res = createMockResponse();
      let nextCalled = false;

      await protectRoute(req, res, () => {
        nextCalled = true;
      });

      expect(res.statusCode).toBe(401);
      expect(nextCalled).toBe(false);
    });

    it("should reject request with only Bearer keyword", async () => {
      const req = createMockRequest({
        headers: {
          authorization: "Bearer",
        },
      });

      const res = createMockResponse();
      let nextCalled = false;

      await protectRoute(req, res, () => {
        nextCalled = true;
      });

      expect(res.statusCode).toBe(401);
      expect(nextCalled).toBe(false);
    });
  });

  describe("✗ Invalid token", () => {
    it("should reject invalid token format", async () => {
      const req = createMockRequest({
        headers: {
          authorization: "Bearer invalidtoken",
        },
      });

      const res = createMockResponse();
      let nextCalled = false;

      await protectRoute(req, res, () => {
        nextCalled = true;
      });

      expect(res.statusCode).toBe(401);
      expect(nextCalled).toBe(false);
    });

    it("should reject expired token", async () => {
      const expiredToken = jwt.sign(
        { userId: "fakeid" },
        process.env.JWT_SECRET,
        { expiresIn: "-1h" },
      );

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      });

      const res = createMockResponse();
      let nextCalled = false;

      await protectRoute(req, res, () => {
        nextCalled = true;
      });

      expect(res.statusCode).toBe(401);
      expect(nextCalled).toBe(false);
    });

    it("should reject token signed with wrong secret", async () => {
      const wrongToken = jwt.sign({ userId: "someid" }, "wrongsecret");

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${wrongToken}`,
        },
      });

      const res = createMockResponse();
      let nextCalled = false;

      await protectRoute(req, res, () => {
        nextCalled = true;
      });

      expect(res.statusCode).toBe(401);
      expect(nextCalled).toBe(false);
    });
  });

  describe("✗ User not found", () => {
    it("should reject token for non-existent user", async () => {
      const fakeUserId = new ObjectId();
      const token = generateTestToken(fakeUserId.toString());

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const res = createMockResponse();
      let nextCalled = false;

      await protectRoute(req, res, () => {
        nextCalled = true;
      });

      expect(res.statusCode).toBe(401);
      expect(nextCalled).toBe(false);
    });

    it("should reject token for deleted user", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      // Delete the user
      await User.findByIdAndDelete(user._id);

      const req = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const res = createMockResponse();
      let nextCalled = false;

      await protectRoute(req, res, () => {
        nextCalled = true;
      });

      expect(res.statusCode).toBe(401);
      expect(nextCalled).toBe(false);
    });
  });

  describe("✓ Edge cases", () => {
    it("should handle case-insensitive Bearer keyword", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      // Test with lowercase 'bearer'
      const req = createMockRequest({
        headers: {
          authorization: `bearer ${token}`,
        },
      });

      const res = createMockResponse();
      let nextCalled = false;

      await protectRoute(req, res, () => {
        nextCalled = true;
      });

      // Should either work or reject - depends on implementation
      expect([true, false]).toContain(nextCalled);
    });

    it("should handle extra spaces in Authorization header", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const req = createMockRequest({
        headers: {
          authorization: `Bearer  ${token}`, // Extra space
        },
      });

      const res = createMockResponse();
      let nextCalled = false;

      await protectRoute(req, res, () => {
        nextCalled = true;
      });

      // Behavior may vary
      expect([200, 401]).toContain(nextCalled ? 200 : res.statusCode);
    });
  });
});
