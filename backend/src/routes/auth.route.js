import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  verifyEmail,
  updateProfile,
  setupSecurityQuestions,
  verifySecurityAnswers,
  resendVerificationOtp,
  resetPassword,
  getSecurityQuestions,
  sendOtp,
  verifyOtp,
} from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";
import { forgotPasswordLimiter, otpRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", otpRateLimiter, verifyEmail);
router.post("/resend-verification-otp", otpRateLimiter, resendVerificationOtp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);
router.put("/update-profile", protectRoute, updateProfile);
router.put("/security-questions", protectRoute, setupSecurityQuestions);
router.post("/verify-security",forgotPasswordLimiter,verifySecurityAnswers);
router.post("/reset-password",forgotPasswordLimiter,resetPassword);
router.post("/get-security-questions", getSecurityQuestions);
router.post("/send-otp", otpRateLimiter, sendOtp);
router.post("/verify-otp", otpRateLimiter, verifyOtp);

export default router;