import { jest } from "@jest/globals";

// Bind the mock to the global object to share it across module link cycles in ESM Jest
global.sendOtpEmailMock = jest.fn();

jest.unstable_mockModule("../../src/lib/sendEmail.js", () => ({
  sendWelcomeEmail: jest.fn(),
  sendOtpEmail: global.sendOtpEmailMock,
}));

import request from "supertest";
import bcrypt from "bcryptjs";

import {
  connectTestDB,
  disconnectTestDB,
} from "../setup.js";

import { cleanupRedis } from "../teardown.js";

const { app } = await import("../../src/index.js");
const { default: User } = await import("../../src/models/user.model.js");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
  await cleanupRedis();
});

afterEach(async () => {
  await User.deleteMany();
  global.sendOtpEmailMock.mockClear();
});

describe("OTP Password Recovery Flow", () => {
  const testEmail = "recover@test.com";

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("oldpassword123", 10);
    await User.create({
      fullName: "Recovery User",
      email: testEmail,
      password: hashedPassword,
      securityQuestions: [
        { question: "Q1", answer: "A1" },
        { question: "Q2", answer: "A2" },
        { question: "Q3", answer: "A3" },
      ],
    });
  });

  describe("POST /api/auth/send-otp", () => {
    it("should return the generic success message if the email does not exist", async () => {
      const response = await request(app)
        .post("/api/auth/send-otp")
        .send({ email: "nonexistent@test.com" });

      await wait(20);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("If an account exists, an OTP has been sent.");
      expect(global.sendOtpEmailMock).not.toHaveBeenCalled();
    });

    it("should generate a hashed OTP, save expiry, send email, and return generic success message", async () => {
      const response = await request(app)
        .post("/api/auth/send-otp")
        .send({ email: testEmail });

      await wait(20);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("If an account exists, an OTP has been sent.");

      // Check that OTP email was triggered
      expect(global.sendOtpEmailMock).toHaveBeenCalledTimes(1);
      expect(global.sendOtpEmailMock.mock.calls[0][0]).toBe(testEmail);
      const sentOtp = global.sendOtpEmailMock.mock.calls[0][1];
      expect(sentOtp).toMatch(/^\d{6}$/); // 6 digits

      // Check DB fields
      const user = await User.findOne({ email: testEmail }).select("+resetOtp +resetOtpExpiry");
      expect(user.resetOtp).not.toBeNull();
      // Verify bcrypt hash matches the sent OTP
      const matches = await bcrypt.compare(sentOtp, user.resetOtp);
      expect(matches).toBe(true);
      expect(user.resetOtpExpiry).toBeInstanceOf(Date);
    });

    it("should enforce the 60-second cooldown on resending", async () => {
      // First send
      await request(app)
        .post("/api/auth/send-otp")
        .send({ email: testEmail });

      await wait(20);

      // Immediate second send should fail with 429
      const response = await request(app)
        .post("/api/auth/send-otp")
        .send({ email: testEmail });

      expect(response.statusCode).toBe(429);
      expect(response.body.message).toContain("Please wait");
      expect(global.sendOtpEmailMock).toHaveBeenCalledTimes(1); // Only first sent
    });
  });

  describe("POST /api/auth/verify-otp", () => {
    it("should reject verification if OTP is expired", async () => {
      // Manually set an expired OTP in database
      const hashedOtp = await bcrypt.hash("123456", 10);
      await User.findOneAndUpdate(
        { email: testEmail },
        {
          resetOtp: hashedOtp,
          resetOtpExpiry: new Date(Date.now() - 1000), // 1 second ago
        }
      );

      const response = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: testEmail, otp: "123456" });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("OTP has expired or is invalid");
    });

    it("should reject verification if OTP is incorrect", async () => {
      // Send OTP to populate fields
      await request(app)
        .post("/api/auth/send-otp")
        .send({ email: testEmail });

      await wait(20);

      const response = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: testEmail, otp: "000000" }); // Wrong OTP

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Invalid email or OTP");
    });

    it("should verify successfully, clear OTP fields, and return resetToken", async () => {
      // Send OTP to get the code
      await request(app)
        .post("/api/auth/send-otp")
        .send({ email: testEmail });

      await wait(20);

      const sentOtp = global.sendOtpEmailMock.mock.calls[0][1];

      // Verify OTP
      const response = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: testEmail, otp: sentOtp });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("resetToken");
      const { resetToken } = response.body;

      // Verify DB cleared OTP fields immediately
      const user = await User.findOne({ email: testEmail }).select("+resetOtp +resetOtpExpiry +passwordResetSession");
      expect(user.resetOtp).toBeNull();
      expect(user.resetOtpExpiry).toBeNull();
      expect(user.passwordResetSession).toBe(resetToken);
    });
  });

  describe("Complete Recovery: Reset Password", () => {
    it("should allow resetting the password with resetToken, then invalidate the token", async () => {
      // 1. Send OTP
      await request(app)
        .post("/api/auth/send-otp")
        .send({ email: testEmail });

      await wait(20);

      const sentOtp = global.sendOtpEmailMock.mock.calls[0][1];

      // 2. Verify OTP
      const verifyRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({ email: testEmail, otp: sentOtp });

      const { resetToken } = verifyRes.body;

      // 3. Reset password
      const resetRes = await request(app)
        .post("/api/auth/reset-password")
        .send({
          email: testEmail,
          resetToken,
          newPassword: "newsecurepassword123",
        });

      expect(resetRes.statusCode).toBe(200);
      expect(resetRes.body.message).toBe("Password reset successful");

      // Verify the password reset session token was cleared
      const user = await User.findOne({ email: testEmail }).select("+passwordResetSession +password");
      expect(user.passwordResetSession).toBeNull();

      // Verify the password was hashed and updated
      const isUpdatedMatch = await bcrypt.compare("newsecurepassword123", user.password);
      expect(isUpdatedMatch).toBe(true);

      // 4. Verify the token cannot be reused
      const secondResetRes = await request(app)
        .post("/api/auth/reset-password")
        .send({
          email: testEmail,
          resetToken,
          newPassword: "anotherpassword123",
        });

      expect(secondResetRes.statusCode).toBe(400);
      expect(secondResetRes.body.message).toBe("Unauthorized reset attempt");
    });
  });
});
