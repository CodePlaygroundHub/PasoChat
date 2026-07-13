process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/refresh_test_db";
process.env.JWT_SECRET = "test-jwt-secret-key-do-not-use-in-production";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-token-secret-key-do-not-use-in-production";

import request from "supertest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Dynamically import app and models after env variables are set
const { app } = await import("../../src/index.js");
const { default: User } = await import("../../src/models/user.model.js");

const runTests = async () => {
  console.log("Connecting to test MongoDB...");
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  console.log("Connected. Cleaning collections...");
  await User.deleteMany({});

  // 1. Create a verified user for testing
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName: "Test User",
    email: "test@example.com",
    password: hashedPassword,
    isVerified: true,
    securityQuestions: [
      { question: "What is your pet name?", answer: await bcrypt.hash("fluffy", 10) },
      { question: "What is your birth city?", answer: await bcrypt.hash("seattle", 10) },
      { question: "What is your favorite color?", answer: await bcrypt.hash("blue", 10) },
    ],
  });

  console.log("Created test user: test@example.com");

  // 2. Perform Login
  console.log("Testing POST /api/auth/login...");
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@example.com", password });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
  }

  const { token } = loginRes.body;
  if (!token) {
    throw new Error("Access token missing from login response");
  }
  console.log("✓ Login returned 200 and access token");

  // Verify cookie is set
  const cookies = loginRes.headers["set-cookie"] || [];
  const refreshCookie = cookies.find(c => c.startsWith("refreshToken="));
  if (!refreshCookie) {
    throw new Error("refreshToken cookie not set in login response headers");
  }
  console.log("✓ refreshToken cookie is set in response headers");

  // Verify hash is saved in DB
  const userInDb = await User.findById(user._id).select("+refreshTokenHash");
  if (!userInDb.refreshTokenHash) {
    throw new Error("refreshTokenHash is not stored in MongoDB");
  }
  console.log("✓ refreshTokenHash successfully stored in MongoDB");

  // 3. Test POST /api/auth/refresh
  console.log("Testing POST /api/auth/refresh with valid token...");
  const refreshRes = await request(app)
    .post("/api/auth/refresh")
    .set("Cookie", [refreshCookie]);

  if (refreshRes.status !== 200) {
    throw new Error(`Refresh failed: ${JSON.stringify(refreshRes.body)}`);
  }

  const newAccessToken = refreshRes.body.token;
  if (!newAccessToken) {
    throw new Error("New access token missing from refresh response");
  }
  console.log("✓ Refresh returned 200 and new access token");

  // 4. Test POST /api/auth/refresh with missing token
  console.log("Testing POST /api/auth/refresh with missing token...");
  const missingRes = await request(app)
    .post("/api/auth/refresh");

  if (missingRes.status !== 400) {
    throw new Error(`Expected 400 for missing refresh token, got ${missingRes.status}`);
  }
  console.log("✓ Refresh with missing token returned 400");

  // 5. Test POST /api/auth/refresh with invalid token
  console.log("Testing POST /api/auth/refresh with invalid token...");
  const invalidRes = await request(app)
    .post("/api/auth/refresh")
    .set("Cookie", ["refreshToken=invalid_token_value_here"]);

  if (invalidRes.status !== 401) {
    throw new Error(`Expected 401 for invalid refresh token, got ${invalidRes.status}`);
  }
  console.log("✓ Refresh with invalid token returned 401");

  // 6. Test POST /api/auth/logout
  console.log("Testing POST /api/auth/logout...");
  const logoutRes = await request(app)
    .post("/api/auth/logout")
    .set("Cookie", [refreshCookie]);

  if (logoutRes.status !== 200) {
    throw new Error(`Logout failed: ${JSON.stringify(logoutRes.body)}`);
  }
  console.log("✓ Logout returned 200");

  // Verify cookie is cleared in response headers
  const clearedCookies = logoutRes.headers["set-cookie"] || [];
  const clearedRefreshCookie = clearedCookies.find(c => c.startsWith("refreshToken="));
  if (!clearedRefreshCookie) {
    throw new Error("refreshToken cookie set-cookie header not found in logout response");
  }
  const cookieLower = clearedRefreshCookie.toLowerCase();
  if (!cookieLower.includes("max-age=0") && !cookieLower.includes("expires=")) {
    throw new Error(`refreshToken cookie not cleared in logout response headers. Got: ${clearedRefreshCookie}`);
  }
  console.log("✓ refreshToken cookie is cleared in logout response headers");

  // Verify hash is removed from DB
  const loggedOutUserInDb = await User.findById(user._id).select("+refreshTokenHash");
  if (loggedOutUserInDb.refreshTokenHash !== null) {
    throw new Error(`refreshTokenHash in MongoDB was not cleared. Got: ${loggedOutUserInDb.refreshTokenHash}`);
  }
  console.log("✓ refreshTokenHash in MongoDB successfully set to null");

  // 7. Test POST /api/auth/refresh after logout (using the revoked token)
  console.log("Testing POST /api/auth/refresh with revoked token...");
  const revokedRes = await request(app)
    .post("/api/auth/refresh")
    .set("Cookie", [refreshCookie]);

  if (revokedRes.status !== 401) {
    throw new Error(`Expected 401 for revoked refresh token, got ${revokedRes.status}`);
  }
  console.log("✓ Refresh with revoked token returned 401");

  console.log("\nALL REFRESH TOKEN TESTS PASSED SUCCESSFULLY! 🎉");
};

runTests()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("Test failed:", err);
    await mongoose.connection.close();
    process.exit(1);
  });
