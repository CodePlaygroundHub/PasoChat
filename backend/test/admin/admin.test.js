/**
 * Admin Functionality Tests
 * Tests for admin operations like user management, banning, deletion
 */

import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOtpEmail: jest.fn(),
  sendVerificationOtpEmail: jest.fn(),
}));

import request from "supertest";
import {
  connectTestDB,
  disconnectTestDB,
  clearAllCollections,
} from "../setup.js";
import { cleanupRedis } from "../teardown.js";
import {
  createTestUser,
  createTestUsers,
  generateTestToken,
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

describe("GET /api/admin/users - List all users", () => {
  describe("✓ Successful retrieval", () => {
    it("should get paginated list of users", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const userPayloads = await createTestUsers(3);
      await User.insertMany(userPayloads);

      const response = await request(app)
        .get("/api/admin/users?page=1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body).toHaveProperty("totalPages");
      expect(response.body).toHaveProperty("currentPage");
    });

    it("should support pagination", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      // Create 15 users
      const userPayloads = await createTestUsers(15);
      await User.insertMany(userPayloads);

      const response = await request(app)
        .get("/api/admin/users?page=1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.users.length).toBeLessThanOrEqual(10);
    });

    it("should support search filter", async () => {
      const adminPayload = await createTestUser({
        role: "admin",
      });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const user1 = await User.create(
        await createTestUser({
          fullName: "John Doe",
          email: "john@test.com",
        })
      );

      const user2 = await User.create(
        await createTestUser({
          fullName: "Jane Smith",
          email: "jane@test.com",
        })
      );

      const response = await request(app)
        .get("/api/admin/users?search=john")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      // Response should contain John
      expect(
        response.body.users.some((u) =>
          u.fullName.toLowerCase().includes("john")
        )
      ).toBe(true);
    });

    it("should support role filter", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const regularUser = await User.create(
        await createTestUser({ role: "user" })
      );

      const response = await request(app)
        .get("/api/admin/users?role=user")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it("should not expose passwords", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      response.body.users.forEach((user) => {
        expect(user).not.toHaveProperty("password");
      });
    });
  });

  describe("✓ Authorization", () => {
    it("should require authentication", async () => {
      const response = await request(app).get("/api/admin/users");

      expect(response.statusCode).toBe(401);
    });
  });
});

describe("PATCH /api/admin/users/:id/ban - Ban/unban user", () => {
  describe("✓ Successful ban operation", () => {
    it("should ban a user", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const userPayload = await createTestUser();
      const user = await User.create(userPayload);

      const response = await request(app)
        .patch(`/api/admin/users/${user._id}/ban`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain("banned");

      const bannedUser = await User.findById(user._id);
      expect(bannedUser.isBanned).toBe(true);
    });

    it("should unban a user", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const userPayload = await createTestUser();
      userPayload.isBanned = true;
      const user = await User.create(userPayload);

      const response = await request(app)
        .patch(`/api/admin/users/${user._id}/ban`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain("unbanned");

      const unbannedUser = await User.findById(user._id);
      expect(unbannedUser.isBanned).toBe(false);
    });

    it("should toggle ban status", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const userPayload = await createTestUser();
      const user = await User.create(userPayload);

      // Ban the user
      await request(app)
        .patch(`/api/admin/users/${user._id}/ban`)
        .set("Authorization", `Bearer ${token}`);

      let bannedUser = await User.findById(user._id);
      expect(bannedUser.isBanned).toBe(true);

      // Unban the user
      await request(app)
        .patch(`/api/admin/users/${user._id}/ban`)
        .set("Authorization", `Bearer ${token}`);

      const unbannedUser = await User.findById(user._id);
      expect(unbannedUser.isBanned).toBe(false);
    });
  });

  describe("✗ User not found", () => {
    it("should return 404 for non-existent user", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .patch(`/api/admin/users/${fakeUserId}/ban`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe("✓ Authorization", () => {
    it("should require authentication", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);

      const response = await request(app).patch(
        `/api/admin/users/${user._id}/ban`
      );

      expect(response.statusCode).toBe(401);
    });
  });
});

describe("DELETE /api/admin/users/:id - Delete user", () => {
  describe("✓ Successful deletion", () => {
    it("should delete a user", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const userPayload = await createTestUser();
      const user = await User.create(userPayload);

      const response = await request(app)
        .delete(`/api/admin/users/${user._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);

      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });

    it("should return success message", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const userPayload = await createTestUser();
      const user = await User.create(userPayload);

      const response = await request(app)
        .delete(`/api/admin/users/${user._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toContain("deleted");
    });
  });

  describe("✗ User not found", () => {
    it("should return 404 for non-existent user", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const fakeUserId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/admin/users/${fakeUserId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe("✓ Authorization", () => {
    it("should require authentication", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);

      const response = await request(app).delete(
        `/api/admin/users/${user._id}`
      );

      expect(response.statusCode).toBe(401);
    });
  });
});

describe("Admin Operations - Security & Edge Cases", () => {
  describe("✗ Injection attacks", () => {
    it("should safely handle NoSQL in user ID", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const response = await request(app)
        .patch("/api/admin/users/{ $ne: null }/ban")
        .set("Authorization", `Bearer ${token}`);

      expect([400, 404]).toContain(response.statusCode);
    });

    it("should safely handle regex in search", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const response = await request(app)
        .get("/api/admin/users?search={ $regex: '.*' }")
        .set("Authorization", `Bearer ${token}`);

      expect([200, 400]).toContain(response.statusCode);
    });
  });

  describe("✓ Concurrent operations", () => {
    it("should handle multiple ban operations safely", async () => {
      const adminPayload = await createTestUser({ role: "admin" });
      const admin = await User.create(adminPayload);
      const token = generateTestToken(admin._id.toString());

      const userPayload = await createTestUser();
      const user = await User.create(userPayload);

      const promises = Array(3)
        .fill(null)
        .map(() =>
          request(app)
            .patch(`/api/admin/users/${user._id}/ban`)
            .set("Authorization", `Bearer ${token}`)
        );

      const responses = await Promise.all(promises);
      responses.forEach((res) => {
        expect(res.statusCode).toBe(200);
      });
    });
  });
});
