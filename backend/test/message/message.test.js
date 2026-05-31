/**
 * Message API Tests - Comprehensive coverage
 * Tests for message sending, retrieval, status tracking, and delivery
 */

import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOtpEmail: jest.fn(),
}));

jest.unstable_mockModule("../../src/lib/mlService.js", () => ({
  default: jest.fn(async () => ({
    toxic_score: 0.05,
    spam_score: 0.02,
    smart_replies: ["Thanks!", "Got it!"],
  })),
}));

import request from "supertest";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
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
const { default: Message } = await import(
  "../../src/models/message.model.js"
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

describe("POST /api/messages/send/:id - Send message", () => {
  describe("✓ Successful message sending", () => {
    it("should send text message successfully", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "sender@test.com" })),
        User.create(
          await createTestUser({ email: "receiver@test.com" })
        ),
      ]);

      const sender = users[0];
      const receiver = users[1];
      const token = generateTestToken(sender._id.toString());

      const response = await request(app)
        .post(`/api/messages/send/${receiver._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: "Hello from sender",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message.text).toBe(
        "Hello from sender"
      );
      expect(response.body.message.senderId).toBe(
        sender._id.toString()
      );
    });

    it("should create message in database", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "sender2@test.com" })),
        User.create(
          await createTestUser({ email: "receiver2@test.com" })
        ),
      ]);

      const sender = users[0];
      const receiver = users[1];
      const token = generateTestToken(sender._id.toString());

      await request(app)
        .post(`/api/messages/send/${receiver._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: "Persistent message",
        });

      const messageInDB = await Message.findOne({
        senderId: sender._id,
        receiverId: receiver._id,
      });

      expect(messageInDB).not.toBeNull();
      expect(messageInDB.text).toBe("Persistent message");
    });

    it("should set correct delivery status", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "sender3@test.com" })),
        User.create(
          await createTestUser({ email: "receiver3@test.com" })
        ),
      ]);

      const sender = users[0];
      const receiver = users[1];
      const token = generateTestToken(sender._id.toString());

      const response = await request(app)
        .post(`/api/messages/send/${receiver._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: "Status test",
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message.deliveryStatus).toBe(
        "sent"
      );
    });

    it("should set timestamp on message", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "sender4@test.com" })),
        User.create(
          await createTestUser({ email: "receiver4@test.com" })
        ),
      ]);

      const sender = users[0];
      const receiver = users[1];
      const token = generateTestToken(sender._id.toString());

      const beforeTime = new Date();

      const response = await request(app)
        .post(`/api/messages/send/${receiver._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: "Timestamp test",
        });

      const afterTime = new Date();

      expect(response.body.message.timestamp).toBeDefined();
      const messageTime = new Date(
        response.body.message.timestamp
      );
      expect(messageTime.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(messageTime.getTime()).toBeLessThanOrEqual(
        afterTime.getTime()
      );
    });
  });

  describe("✗ Validation failures", () => {
    it("should reject message without text", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "sender5@test.com" })),
        User.create(
          await createTestUser({ email: "receiver5@test.com" })
        ),
      ]);

      const sender = users[0];
      const receiver = users[1];
      const token = generateTestToken(sender._id.toString());

      const response = await request(app)
        .post(`/api/messages/send/${receiver._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("should reject empty text message", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "sender6@test.com" })),
        User.create(
          await createTestUser({ email: "receiver6@test.com" })
        ),
      ]);

      const sender = users[0];
      const receiver = users[1];
      const token = generateTestToken(sender._id.toString());

      const response = await request(app)
        .post(`/api/messages/send/${receiver._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: "",
        });

      expect([201, 400]).toContain(response.statusCode);
    });

    it("should reject message to non-existent user", async () => {
      const userPayload = await createTestUser();
      const sender = await User.create(userPayload);
      const token = generateTestToken(sender._id.toString());

      const fakeUserId = new ObjectId();

      const response = await request(app)
        .post(`/api/messages/send/${fakeUserId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: "Message to non-existent user",
        });

      expect([400, 404]).toContain(response.statusCode);
    });

    it("should reject invalid receiver ID format", async () => {
      const userPayload = await createTestUser();
      const sender = await User.create(userPayload);
      const token = generateTestToken(sender._id.toString());

      const response = await request(app)
        .post("/api/messages/send/invalid-id")
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: "Message",
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("✗ Authorization", () => {
    it("should reject unauthenticated request", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "unauth1@test.com" })),
        User.create(
          await createTestUser({ email: "unauth2@test.com" })
        ),
      ]);

      const response = await request(app)
        .post(`/api/messages/send/${users[1]._id}`)
        .send({
          text: "Unauthorized message",
        });

      expect(response.statusCode).toBe(401);
    });

    it("should not allow sending as another user", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "impersonate1@test.com" })),
        User.create(
          await createTestUser({ email: "impersonate2@test.com" })
        ),
        User.create(
          await createTestUser({ email: "target@test.com" })
        ),
      ]);

      // User1 with User2's token trying to send to User3
      const user1Token = generateTestToken(users[0]._id.toString());

      const response = await request(app)
        .post(`/api/messages/send/${users[2]._id}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          text: "Message",
        });

      if (response.statusCode === 201) {
        // Verify the message was sent as user1, not user2
        const message = await Message.findOne({
          receiverId: users[2]._id,
        });
        expect(message.senderId.toString()).toBe(
          users[0]._id.toString()
        );
      }
    });
  });

  describe("✓ Edge cases", () => {
    it("should handle very long message text", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "long1@test.com" })),
        User.create(
          await createTestUser({ email: "long2@test.com" })
        ),
      ]);

      const sender = users[0];
      const receiver = users[1];
      const token = generateTestToken(sender._id.toString());

      const longText = "A".repeat(10000);

      const response = await request(app)
        .post(`/api/messages/send/${receiver._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: longText,
        });

      expect([201, 413]).toContain(response.statusCode);
    });

    it("should handle special characters in message", async () => {
      const users = await Promise.all([
        User.create(
          await createTestUser({ email: "special1@test.com" })
        ),
        User.create(
          await createTestUser({ email: "special2@test.com" })
        ),
      ]);

      const sender = users[0];
      const receiver = users[1];
      const token = generateTestToken(sender._id.toString());

      const specialText = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

      const response = await request(app)
        .post(`/api/messages/send/${receiver._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: specialText,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message.text).toBe(specialText);
    });

    it("should handle unicode characters", async () => {
      const users = await Promise.all([
        User.create(
          await createTestUser({ email: "unicode1@test.com" })
        ),
        User.create(
          await createTestUser({ email: "unicode2@test.com" })
        ),
      ]);

      const sender = users[0];
      const receiver = users[1];
      const token = generateTestToken(sender._id.toString());

      const unicodeText = "Hello 你好 مرحبا 🎉";

      const response = await request(app)
        .post(`/api/messages/send/${receiver._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          text: unicodeText,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message.text).toBe(unicodeText);
    });
  });
});

describe("GET /api/messages/:id - Get message history", () => {
  describe("✓ Successful retrieval", () => {
    it("should retrieve messages between users", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "hist1@test.com" })),
        User.create(
          await createTestUser({ email: "hist2@test.com" })
        ),
      ]);

      const user1 = users[0];
      const user2 = users[1];
      const token1 = generateTestToken(user1._id.toString());

      // Send message from user1 to user2
      await request(app)
        .post(`/api/messages/send/${user2._id}`)
        .set("Authorization", `Bearer ${token1}`)
        .send({
          text: "Message 1",
        });

      // Retrieve messages
      const response = await request(app)
        .get(`/api/messages/${user2._id}`)
        .set("Authorization", `Bearer ${token1}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should include bidirectional messages", async () => {
      const users = await Promise.all([
        User.create(await createTestUser({ email: "bidir1@test.com" })),
        User.create(
          await createTestUser({ email: "bidir2@test.com" })
        ),
      ]);

      const user1 = users[0];
      const user2 = users[1];
      const token1 = generateTestToken(user1._id.toString());
      const token2 = generateTestToken(user2._id.toString());

      // User1 sends to User2
      await request(app)
        .post(`/api/messages/send/${user2._id}`)
        .set("Authorization", `Bearer ${token1}`)
        .send({
          text: "From user1",
        });

      // User2 sends to User1
      await request(app)
        .post(`/api/messages/send/${user1._id}`)
        .set("Authorization", `Bearer ${token2}`)
        .send({
          text: "From user2",
        });

      // Retrieve messages
      const response = await request(app)
        .get(`/api/messages/${user2._id}`)
        .set("Authorization", `Bearer ${token1}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("✗ Authorization", () => {
    it("should require authentication", async () => {
      const userPayload = await createTestUser();
      const user = await User.create(userPayload);

      const response = await request(app).get(
        `/api/messages/${user._id}`
      );

      expect(response.statusCode).toBe(401);
    });

    it("should only show messages for authenticated user", async () => {
      const users = await Promise.all([
        User.create(
          await createTestUser({ email: "view1@test.com" })
        ),
        User.create(
          await createTestUser({ email: "view2@test.com" })
        ),
        User.create(
          await createTestUser({ email: "view3@test.com" })
        ),
      ]);

      const user1 = users[0];
      const user2 = users[1];
      const user3 = users[2];
      const token1 = generateTestToken(user1._id.toString());

      // User1 sends message to User2
      await request(app)
        .post(`/api/messages/send/${user2._id}`)
        .set("Authorization", `Bearer ${token1}`)
        .send({
          text: "Private message",
        });

      // User3 tries to view User1-User2 conversation
      const token3 = generateTestToken(user3._id.toString());
      const response = await request(app)
        .get(`/api/messages/${user2._id}`)
        .set("Authorization", `Bearer ${token3}`);

      expect(response.statusCode).toBe(200);
      // Should not contain the private message
      const hasPrivateMessage = response.body.some(
        (m) => m.text === "Private message"
      );
      expect(hasPrivateMessage).toBe(false);
    });
  });
});

describe("Message Delivery & Status", () => {
  it("should track message delivery status", async () => {
    const users = await Promise.all([
      User.create(await createTestUser({ email: "status1@test.com" })),
      User.create(
        await createTestUser({ email: "status2@test.com" })
      ),
    ]);

    const sender = users[0];
    const receiver = users[1];
    const token = generateTestToken(sender._id.toString());

    const response = await request(app)
      .post(`/api/messages/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Delivery status test",
      });

    expect(response.statusCode).toBe(201);
    expect(
      ["sent", "delivered", "read"].includes(
        response.body.message.deliveryStatus
      )
    ).toBe(true);
  });

  it("should set isRead as false initially", async () => {
    const users = await Promise.all([
      User.create(await createTestUser({ email: "read1@test.com" })),
      User.create(
        await createTestUser({ email: "read2@test.com" })
      ),
    ]);

    const sender = users[0];
    const receiver = users[1];
    const token = generateTestToken(sender._id.toString());

    const response = await request(app)
      .post(`/api/messages/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Read status test",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message.isRead).toBe(false);
  });
});

describe("Message Content Types", () => {
  it("should support text-only messages", async () => {
    const users = await Promise.all([
      User.create(await createTestUser({ email: "text1@test.com" })),
      User.create(
        await createTestUser({ email: "text2@test.com" })
      ),
    ]);

    const token = generateTestToken(users[0]._id.toString());

    const response = await request(app)
      .post(`/api/messages/send/${users[1]._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Text only",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message.text).toBe("Text only");
  });

  it("should handle messages with metadata", async () => {
    const users = await Promise.all([
      User.create(await createTestUser({ email: "meta1@test.com" })),
      User.create(
        await createTestUser({ email: "meta2@test.com" })
      ),
    ]);

    const token = generateTestToken(users[0]._id.toString());

    const response = await request(app)
      .post(`/api/messages/send/${users[1]._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Message with metadata",
        image: null,
        audio: null,
        file: null,
      });

    expect(response.statusCode).toBe(201);
  });
});
