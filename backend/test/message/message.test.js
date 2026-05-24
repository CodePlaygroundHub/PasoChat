import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
}));

jest.unstable_mockModule("../../src/lib/mlService.js", () => ({
  default: jest.fn(async () => ({
    toxic_score: 0,
    spam_score: 0,
    smart_replies: ["Hello!"],
  })),
}));

import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import {
  connectTestDB,
  disconnectTestDB,
} from "../setup.js";

import { cleanupRedis } from "../teardown.js";

const { app } = await import("../../src/index.js");

const { default: User } = await import(
  "../../src/models/user.model.js"
);

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
  await User.deleteMany();
  await Message.deleteMany();
});

describe("Message APIs", () => {
  it("should send text message successfully", async () => {
    const sender = await User.create({
      fullName: "Sender",
      email: "sender@test.com",
      password: "password123",

      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
    });

    const receiver = await User.create({
      fullName: "Receiver",
      email: "receiver@test.com",
      password: "password123",

      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
    });

    const token = jwt.sign(
      { userId: sender._id },
      process.env.JWT_SECRET
    );

    const response = await request(app)
      .post(`/api/messages/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Hello from integration test",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.message.text).toBe(
      "Hello from integration test"
    );

    const messageInDB = await Message.findOne({
      senderId: sender._id,
      receiverId: receiver._id,
    });

    expect(messageInDB).not.toBeNull();
  });

  it("should reject empty message", async () => {
    const sender = await User.create({
      fullName: "Sender",
      email: "sender2@test.com",
      password: "password123",

      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
    });

    const receiver = await User.create({
      fullName: "Receiver",
      email: "receiver2@test.com",
      password: "password123",

      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
    });

    const token = jwt.sign(
      { userId: sender._id },
      process.env.JWT_SECRET
    );

    const response = await request(app)
      .post(`/api/messages/send/${receiver._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Message cannot be empty"
    );
  });

  it("should reject unauthorized message request", async () => {
    const fakeReceiverId =
      new mongoose.Types.ObjectId();

    const response = await request(app)
      .post(`/api/messages/send/${fakeReceiverId}`)
      .send({
        text: "Unauthorized message",
      });

    expect(response.statusCode).toBe(401);
  });
});