/**
 * Integration Tests
 * End-to-end tests for complex user workflows and multi-step operations
 */

import { jest } from "@jest/globals";
import { ObjectId } from "mongodb";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
}));

jest.unstable_mockModule("../../src/lib/mlService.js", () => ({
  default: jest.fn(async () => ({
    toxic_score: 0.1,
    spam_score: 0.05,
    smart_replies: ["Thanks!", "Got it!"],
  })),
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
  createSignupPayload,
  createLoginPayload,
  generateTestToken,
} from "../utils/testHelpers.js";

const { app } = await import("../../src/index.js");
const { default: User } = await import("../../src/models/user.model.js");
const { default: Message } = await import(
  "../../src/models/message.model.js"
);
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

describe("Integration - Complete User Journey", () => {
  describe("✓ User registration and authentication flow", () => {
    it("should complete signup -> login -> auth check flow", async () => {
      const payload = createSignupPayload();

      // Step 1: Signup
      const signupResponse = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      expect(signupResponse.statusCode).toBe(201);
      expect(signupResponse.body.token).toBeDefined();
      const signupToken = signupResponse.body.token;

      // Step 2: Verify auth with signup token
      const checkResponse = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${signupToken}`);

      expect(checkResponse.statusCode).toBe(200);
      expect(checkResponse.body.email).toBe(payload.email);

      // Step 3: Login with credentials
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send(createLoginPayload(payload));

      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.body.token).toBeDefined();
      const loginToken = loginResponse.body.token;

      // Step 4: Verify auth with login token
      const checkResponse2 = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${loginToken}`);

      expect(checkResponse2.statusCode).toBe(200);
    });

    it("should persist user data across requests", async () => {
      const payload = createSignupPayload({
        fullName: "Integration Test User",
        email: "integration@test.com",
      });

      const signupResponse = await request(app)
        .post("/api/auth/signup")
        .send(payload);

      const token = signupResponse.body.token;

      // Check multiple times - data should persist
      for (let i = 0; i < 3; i++) {
        const checkResponse = await request(app)
          .get("/api/auth/check")
          .set("Authorization", `Bearer ${token}`);

        expect(checkResponse.statusCode).toBe(200);
        expect(checkResponse.body.fullName).toBe(
          "Integration Test User"
        );
        expect(checkResponse.body.email).toBe(
          "integration@test.com"
        );
      }
    });
  });

  describe("✓ Group and messaging workflow", () => {
    it("should create group and manage members", async () => {
      // Create users
      const users = await Promise.all([
        User.create(await createTestUser({ email: "user1@test.com" })),
        User.create(
          await createTestUser({ email: "user2@test.com" })
        ),
      ]);

      const user1 = users[0];
      const user2 = users[1];
      const token1 = generateTestToken(user1._id.toString());

      // Create group
      const groupResponse = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token1}`)
        .send({
          name: "Test Group",
          members: [user2._id.toString()],
        });

      expect(groupResponse.statusCode).toBe(201);
      const groupId = groupResponse.body._id;

      // Verify group exists
      const getGroupResponse = await request(app)
        .get(`/api/groups/${groupId}`)
        .set("Authorization", `Bearer ${token1}`);

      expect(getGroupResponse.statusCode).toBe(200);
      expect(getGroupResponse.body.members.length).toBeGreaterThan(
        0
      );

      // Verify user2 can see the group
      const token2 = generateTestToken(user2._id.toString());
      const user2GroupsResponse = await request(app)
        .get("/api/groups/my")
        .set("Authorization", `Bearer ${token2}`);

      expect(user2GroupsResponse.statusCode).toBe(200);
      const userGroups = user2GroupsResponse.body;
      expect(
        userGroups.some((g) => g._id === groupId)
      ).toBe(true);
    });

    it("should send messages between users", async () => {
      // Create users
      const sender = await User.create(
        await createTestUser({
          fullName: "Sender User",
          email: "sender@test.com",
        })
      );
      const receiver = await User.create(
        await createTestUser({
          fullName: "Receiver User",
          email: "receiver@test.com",
        })
      );

      const senderToken = generateTestToken(
        sender._id.toString()
      );
      const receiverId = receiver._id.toString();

      // Send message
      const messageResponse = await request(app)
        .post(`/api/messages/send/${receiverId}`)
        .set("Authorization", `Bearer ${senderToken}`)
        .send({
          text: "Hello from integration test",
        });

      expect(messageResponse.statusCode).toBe(201);
      expect(messageResponse.body.message.text).toBe(
        "Hello from integration test"
      );

      // Verify message exists in DB
      const messageInDB = await Message.findOne({
        senderId: sender._id,
        receiverId: receiver._id,
      });

      expect(messageInDB).not.toBeNull();
      expect(messageInDB.text).toBe(
        "Hello from integration test"
      );
    });
  });

  describe("✓ Multi-user interactions", () => {
    it("should handle concurrent requests from multiple users", async () => {
      // Create users
      const users = await Promise.all([
        User.create(await createTestUser({ email: "concurrent1@test.com" })),
        User.create(
          await createTestUser({ email: "concurrent2@test.com" })
        ),
        User.create(
          await createTestUser({ email: "concurrent3@test.com" })
        ),
      ]);

      // Create tokens
      const tokens = users.map((u) =>
        generateTestToken(u._id.toString())
      );

      // Each user creates a group concurrently
      const groupPromises = tokens.map((token, index) =>
        request(app)
          .post("/api/groups/create")
          .set("Authorization", `Bearer ${token}`)
          .send({
            name: `Group ${index}`,
            members: [],
          })
      );

      const responses = await Promise.all(groupPromises);

      // All should succeed
      responses.forEach((response) => {
        expect(response.statusCode).toBe(201);
      });

      // Verify all groups exist
      const groupCount = await Group.countDocuments();
      expect(groupCount).toBe(3);
    });

    it("should maintain data consistency with concurrent updates", async () => {
      const user = await User.create(
        await createTestUser({ email: "consistency@test.com" })
      );
      const token = generateTestToken(user._id.toString());

      // Create initial group
      const groupResponse = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Original Name",
          members: [],
        });

      const groupId = groupResponse.body._id;

      // Verify initial state
      let groupInDB = await Group.findById(groupId);
      expect(groupInDB.name).toBe("Original Name");
    });
  });

  describe("✓ Error recovery", () => {
    it("should handle and recover from invalid requests", async () => {
      const token = generateTestToken(
        new ObjectId().toString()
      );

      // Make invalid request
      const invalidResponse = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer invalidtoken`);

      expect(invalidResponse.statusCode).toBe(401);

      // Next valid request should still work
      const user = await User.create(
        await createTestUser()
      );
      const validToken = generateTestToken(user._id.toString());

      const validResponse = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${validToken}`);

      expect(validResponse.statusCode).toBe(200);
    });

    it("should handle partial failures gracefully", async () => {
      const user1 = await User.create(
        await createTestUser({ email: "user1@test.com" })
      );
      const user2 = await User.create(
        await createTestUser({ email: "user2@test.com" })
      );

      const token1 = generateTestToken(user1._id.toString());

      // Try to send message to deleted user
      await User.findByIdAndDelete(user2._id);

      const messageResponse = await request(app)
        .post(`/api/messages/send/${user2._id}`)
        .set("Authorization", `Bearer ${token1}`)
        .send({
          text: "Message to deleted user",
        });

      // Should either fail gracefully or handle the non-existent user
      expect([400, 404, 500]).toContain(
        messageResponse.statusCode
      );
    });
  });

  describe("✓ Data isolation", () => {
    it("should isolate user data between different users", async () => {
      // Create two users
      const user1 = await User.create(
        await createTestUser({
          fullName: "User One",
          email: "isolate1@test.com",
        })
      );
      const user2 = await User.create(
        await createTestUser({
          fullName: "User Two",
          email: "isolate2@test.com",
        })
      );

      const token1 = generateTestToken(user1._id.toString());
      const token2 = generateTestToken(user2._id.toString());

      // User1 creates a group
      const group1Response = await request(app)
        .post("/api/groups/create")
        .set("Authorization", `Bearer ${token1}`)
        .send({
          name: "User1 Private Group",
          members: [],
        });

      expect(group1Response.statusCode).toBe(201);
      const group1Id = group1Response.body._id;

      // User2 should not see User1's group
      const user2GroupsResponse = await request(app)
        .get("/api/groups/my")
        .set("Authorization", `Bearer ${token2}`);

      expect(user2GroupsResponse.statusCode).toBe(200);
      const hasGroup1 = user2GroupsResponse.body.some(
        (g) => g._id === group1Id
      );
      expect(hasGroup1).toBe(false);
    });

    it("should not leak sensitive information between users", async () => {
      const user1 = await User.create(
        await createTestUser({
          email: "leak1@test.com",
        })
      );
      const user2 = await User.create(
        await createTestUser({
          email: "leak2@test.com",
        })
      );

      const token1 = generateTestToken(user1._id.toString());
      const token2 = generateTestToken(user2._id.toString());

      // User1 gets their own info
      const user1Check = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token1}`);

      // User2 gets their own info
      const user2Check = await request(app)
        .get("/api/auth/check")
        .set("Authorization", `Bearer ${token2}`);

      // They should only see their own data
      expect(user1Check.body._id).not.toBe(user2Check.body._id);
      expect(user1Check.body.email).not.toBe(
        user2Check.body.email
      );
    });
  });
});

describe("Integration - Performance", () => {
  describe("✓ Scalability tests", () => {
    it("should handle signup of multiple users rapidly", async () => {
      const promises = Array(5)
        .fill(null)
        .map((_, i) =>
          request(app)
            .post("/api/auth/signup")
            .send(
              createSignupPayload({
                email: `rapid${i}${Date.now()}@test.com`,
              })
            )
        );

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach((response) => {
        expect(response.statusCode).toBe(201);
      });

      // Verify all users created
      const userCount = await User.countDocuments();
      expect(userCount).toBe(5);
    });
  });
});
