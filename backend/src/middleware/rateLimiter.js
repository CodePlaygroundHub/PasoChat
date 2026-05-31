import rateLimit from "express-rate-limit";

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 attempts
  message: {
    message: "Too many attempts. Try again later.",
  },
  skip: () => process.env.NODE_ENV === "test",
});

export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // max 5 requests per IP
  message: {
    message: "Too many OTP requests from this IP. Please try again later.",
  },
  skip: () => process.env.NODE_ENV === "test",
});