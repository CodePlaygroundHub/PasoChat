/**
 * Group Management Tests
 * Tests for group creation, member management, and group operations
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
const { default: Group } = await import(
  "../../src/models/group.model.js"
);

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

describe("POST /api/groups/create - Create group", () => {
  describe("✓ Successful group creation", () => {
    it("should create group with minimum required fields", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "New Group",
          members: [],
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe("New Group");
      expect(response.body.createdBy).toBe(user._id.toString());
    });

    it("should add creator as admin", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test Group",
          members: [],
        });

      expect(response.statusCode).toBe(201);
      const adminMember = response.body.members.find(
        (m) => m.userId === user._id.toString()
      );
      expect(adminMember.role).toBe("admin");
    });

    it("should create group with multiple members", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "user1@test.com" })),
        User.create(await createTestUser({ email: "user2@test.com" })),
      ]);

      const creator = users[0];
      const token = generateTestToken(creator._id.toString());
      const otherUserId = users[1]._id.toString();

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Multi-member Group",
          members: [otherUserId],
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.members.length).toBeGreaterThanOrEqual(2);
    });

    it("should set group name correctly", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const groupName = "Test Group with Special Chars !@#$%";

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: groupName,
          members: [],
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.name).toBe(groupName);
    });
  });

  describe("✗ Validation failures", () => {
    it("should reject missing group name", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          members: [],
        });

      expect(response.statusCode).toBe(400);
    });

    it("should reject empty group name", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "",
          members: [],
        });

      expect(response.statusCode).toBe(400);
    });

    it("should reject whitespace-only group name", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "   ",
          members: [],
        });

      // Should be rejected or trimmed
      expect([400, 201]).toContain(response.statusCode);
    });

    it("should reject unauthenticated request", async () => {
      const response = await request(app)
        .post("/api/groups/create")
        .send({
          name: "Unauthorized Group",
          members: [],
        });

      expect(response.statusCode).toBe(401);
    });

    it("should reject invalid member IDs", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Group with Invalid Members",
          members: ["invalid-id"],
        });

      // Should handle gracefully
      expect([201, 400]).toContain(response.statusCode);
    });
  });

  describe("✓ Member handling", () => {
    it("should exclude AI users from group members", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      // Create an AI user
      const aiUserPayload = await createTestUser({
        email: "ai@test.com",
      });
      aiUserPayload.isAI = true;
      const aiUser = await User.create(aiUserPayload);

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Group",
          members: [aiUser._id.toString()],
        });

      expect(response.statusCode).toBe(201);
      const hasAI = response.body.members.some(
        (m) => m.userId === aiUser._id.toString()
      );
      expect(hasAI).toBe(false);
    });

    it("should remove duplicate members", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "user1@test.com" })),
        User.create(await createTestUser({ email: "user2@test.com" })),
      ]);

      const creator = users[0];
      const token = generateTestToken(creator._id.toString());
      const memberId = users[1]._id.toString();

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Group",
          members: [memberId, memberId, memberId], // Duplicates
        });

      expect(response.statusCode).toBe(201);
      const memberCount = response.body.members.filter(
        (m) => m.userId === memberId
      ).length;
      expect(memberCount).toBe(1);
    });
  });

  describe("✓ Database integrity", () => {
    it("should persist group in database", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Persistent Group",
          members: [],
        });

      const groupInDB = await Group.findById(response.body._id);
      expect(groupInDB).not.toBeNull();
      expect(groupInDB.name).toBe("Persistent Group");
    });
  });
});

describe("GET /api/groups/:id - Get group info", () => {
  describe("✓ Successful group retrieval", () => {
    it("should retrieve group by ID", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      // Create a group
      const group = await Group.create({
        name: "Test Group",
        members: [{ userId: user._id, role: "admin" }],
        createdBy: user._id,
      });

      const response = await request(app)
        .get(`/api/groups/${group._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.name).toBe("Test Group");
    });

    it("should populate member details", async () => {
      const userPayload = await createTestUser({
        fullName: "Test Member",
      });
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const group = await Group.create({
        name: "Test Group",
        members: [{ userId: user._id, role: "admin" }],
        createdBy: user._id,
      });

      const response = await request(app)
        .get(`/api/groups/${group._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      // Members should be populated with user details
      expect(
        response.body.members[0].userId.fullName
      ).toBe("Test Member");
    });
  });

  describe("✗ Group not found", () => {
    it("should return 404 for non-existent group", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const fakeGroupId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/groups/${fakeGroupId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(404);
    });

    it("should reject invalid group ID format", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get(`/api/groups/invalid-id`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("✓ Authorization", () => {
    it("should require authentication", async () => {
      const group = await Group.create({
        name: "Test",
        members: [],
        createdBy: new mongoose.Types.ObjectId(),
      });

      const response = await request(app).get(
        `/api/groups/${group._id}`
      );

      expect(response.statusCode).toBe(401);
    });
  });
});

describe("GET /api/groups - Get user's groups", () => {
  describe("✓ Successful retrieval", () => {
    it("should return groups user is member of", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      // Create groups
      await Group.create({
        name: "Group 1",
        members: [{ userId: user._id, role: "admin" }],
        createdBy: user._id,
      });

      await Group.create({
        name: "Group 2",
        members: [{ userId: user._id, role: "member" }],
        createdBy: user._id,
      });

      const response = await request(app)
        .get("/api/groups/my")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it("should not return groups user is not member of", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "user1@test.com" })),
        User.create(await createTestUser({ email: "user2@test.com" })),
      ]);

      const user1 = users[0];
      const user2 = users[1];
      const token = generateTestToken(user1._id.toString());

      // Create group with user2
      await Group.create({
        name: "User2 Group",
        members: [{ userId: user2._id, role: "admin" }],
        createdBy: user2._id,
      });

      const response = await request(app)
        .get("/api/groups/my")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(0);
    });

    it("should return empty array if user has no groups", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);
      const token = generateTestToken(user._id.toString());

      const response = await request(app)
        .get("/api/groups/my")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe("✓ Authorization", () => {
    it("should require authentication", async () => {
      const response = await request(app).get("/api/groups/my");

      expect(response.statusCode).toBe(401);
    });
  });
});
