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

export const gifRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 GIF searches/trending calls per IP per minute
  message: {
    message: "Too many GIF requests. Please slow down and try again shortly.",
  },
  skip: () => process.env.NODE_ENV === "test",
});