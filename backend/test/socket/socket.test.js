import { jest } from "@jest/globals";

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
}));

import { io as Client } from "socket.io-client";

import {
  connectTestDB,
  disconnectTestDB,
} from "../setup.js";

import { cleanupRedis } from "../teardown.js";

const { server } = await import(
  "../../src/lib/socket.js"
);

const { default: User } = await import(
  "../../src/models/user.model.js"
);

let httpServer;
let clientSocket;

beforeAll(async () => {
  await connectTestDB();

  await new Promise((resolve) => {
    httpServer = server.listen(0, resolve);
  });
});

afterAll(async () => {
  if (clientSocket?.connected) {
    clientSocket.disconnect();
  }

  await new Promise((resolve) => {
    httpServer.close(resolve);
  });

  await disconnectTestDB();

  await cleanupRedis();
});

afterEach(async () => {
  await User.deleteMany();
});

describe("Socket.IO Connection", () => {
  it("should connect user socket successfully", async () => {
    const user = await User.create({
      fullName: "Socket User",
      email: "socket@test.com",
      password: "password123",

      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
    });

    const port = httpServer.address().port;

    clientSocket = new Client(
      `http://localhost:${port}`,
      {
        auth: {
          userId: user._id.toString(),
        },

        transports: ["websocket"],
      }
    );

    await new Promise((resolve, reject) => {
      clientSocket.on("connect", resolve);

      clientSocket.on(
        "connect_error",
        reject
      );
    });

    expect(clientSocket.connected).toBe(
      true
    );
  });
});