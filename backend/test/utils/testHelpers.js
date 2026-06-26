/**
 * Reusable test utilities and factory functions
 * Provides helper functions for creating test data and assertions
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// ============================================================================
// DATABASE FACTORIES
// ============================================================================

/**
 * Create a test user with optional overrides
 * @param {Object} overrides - Property overrides
 * @returns {Object} User object ready for database insertion
 */
export const createTestUser = async (overrides = {}) => {
  const password = overrides.password || "testPassword123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const securityQuestions = overrides.securityQuestions || [
    { question: "What is your pet name?", answer: await bcrypt.hash("fluffy", 10) },
    { question: "What is your birth city?", answer: await bcrypt.hash("seattle", 10) },
    { question: "What is your favorite color?", answer: await bcrypt.hash("blue", 10) },
  ];

  return {
    fullName: "Test User",
    email: `test${Date.now()}@test.com`,
    password: hashedPassword,
    securityQuestions,
    role: "user",
    isVerified: true,
    isOnline: false,
    profilePic: "",
    emailVerificationOtp: null,
    emailVerificationOtpExpiry: null,
    ...overrides,
  };
};

/**
 * Create multiple test users
 * @param {number} count - Number of users to create
 * @returns {Promise<Array>} Array of user objects
 */
export const createTestUsers = async (count = 2) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    users.push(
      await createTestUser({
        email: `user${i + 1}@test.com`,
        fullName: `Test User ${i + 1}`,
      })
    );
  }
  return users;
};

/**
 * Create a test group
 * @param {Object} overrides - Property overrides
 * @returns {Object} Group object ready for database insertion
 */
export const createTestGroup = (overrides = {}) => {
  return {
    name: "Test Group",
    avatar: "",
    members: [],
    createdBy: null,
    ...overrides,
  };
};

/**
 * Create a test message
 * @param {Object} overrides - Property overrides
 * @returns {Object} Message object ready for database insertion
 */
export const createTestMessage = (overrides = {}) => {
  return {
    senderId: null,
    receiverId: null,
    text: "Test message",
    image: null,
    audio: null,
    file: null,
    timestamp: new Date(),
    isRead: false,
    deliveryStatus: "sent",
    ...overrides,
  };
};

// ============================================================================
// JWT & AUTH HELPERS
// ============================================================================

/**
 * Generate a valid JWT token for testing
 * @param {string} userId - User ID to encode in token
 * @param {Object} options - Token options
 * @returns {string} Valid JWT token
 */
export const generateTestToken = (userId, options = {}) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
    ...options,
  });
};

/**
 * Generate an expired JWT token
 * @param {string} userId - User ID to encode in token
 * @returns {string} Expired JWT token
 */
export const generateExpiredToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "-1h", // Expired 1 hour ago
  });
};

/**
 * Generate a malformed JWT token
 * @returns {string} Malformed JWT token
 */
export const generateMalformedToken = () => {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.invalid";
};

/**
 * Hash a password for testing
 * @param {string} password - Password to hash
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

/**
 * Compare password with hash
 * @param {string} password - Plain password
 * @param {string} hash - Password hash
 * @returns {Promise<boolean>} True if match
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// ============================================================================
// REQUEST HELPERS
// ============================================================================

/**
 * Get auth headers with Bearer token
 * @param {string} token - JWT token
 * @returns {Object} Headers object
 */
export const getAuthHeaders = (token) => {
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * Create a test signup payload
 * @param {Object} overrides - Property overrides
 * @returns {Object} Signup payload
 */
export const createSignupPayload = (overrides = {}) => {
  return {
    fullName: "New Test User",
    email: `signup${Date.now()}@test.com`,
    password: "TestPassword123",
    securityQuestions: [
      { question: "Your pet?", answer: "fluffy" },
      { question: "Birth city?", answer: "seattle" },
      { question: "Favorite color?", answer: "blue" },
    ],
    ...overrides,
  };
};

/**
 * Create a test login payload
 * @param {Object} overrides - Property overrides
 * @returns {Object} Login payload
 */
export const createLoginPayload = (overrides = {}) => {
  return {
    email: "test@test.com",
    password: "testPassword123",
    ...overrides,
  };
};

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Assert valid user response structure
 * @param {Object} user - User object to validate
 */
export const assertValidUserResponse = (user) => {
  expect(user).toHaveProperty("_id");
  expect(user).toHaveProperty("fullName");
  expect(user).toHaveProperty("email");
  expect(user).toHaveProperty("role");
  expect(user).not.toHaveProperty("password");
  expect(user).not.toHaveProperty("securityQuestions");
};

/**
 * Assert valid auth response structure
 * @param {Object} response - Response object to validate
 */
export const assertValidAuthResponse = (response) => {
  expect(response).toHaveProperty("_id");
  expect(response).toHaveProperty("token");
  expect(response).toHaveProperty("email");
  expect(response).toHaveProperty("fullName");
  assertValidUserResponse(response);
};

/**
 * Assert valid message response structure
 * @param {Object} message - Message object to validate
 */
export const assertValidMessageResponse = (message) => {
  expect(message).toHaveProperty("_id");
  expect(message).toHaveProperty("senderId");
  expect(message).toHaveProperty("receiverId");
  expect(message).toHaveProperty("timestamp");
  expect(message).toHaveProperty("deliveryStatus");
};

/**
 * Assert valid group response structure
 * @param {Object} group - Group object to validate
 */
export const assertValidGroupResponse = (group) => {
  expect(group).toHaveProperty("_id");
  expect(group).toHaveProperty("name");
  expect(group).toHaveProperty("members");
  expect(group).toHaveProperty("createdBy");
  expect(Array.isArray(group.members)).toBe(true);
};

// ============================================================================
// MONGODB HELPERS
// ============================================================================

/**
 * Create ObjectId helper
 * @param {string} id - String ID to convert (optional)
 * @returns {Object} MongoDB ObjectId
 */
export const createObjectId = () => {
  return new mongoose.Types.ObjectId();
};

/**
 * Validate ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================================
// SOCKET.IO HELPERS
// ============================================================================

/**
 * Wait for a socket event with timeout
 * @param {Object} socket - Socket.IO client
 * @param {string} eventName - Event name to wait for
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<any>} Event data
 */
export const waitForSocketEvent = (socket, eventName, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(eventName);
      reject(new Error(`Timeout waiting for event: ${eventName}`));
    }, timeout);

    socket.on(eventName, (data) => {
      clearTimeout(timer);
      socket.off(eventName);
      resolve(data);
    });
  });
};

/**
 * Wait for socket connection
 * @param {Object} socket - Socket.IO client
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<void>}
 */
export const waitForSocketConnection = (socket, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      socket.off("connect");
      socket.off("connect_error");
      reject(new Error("Socket connection timeout"));
    }, timeout);

    socket.on("connect", () => {
      clearTimeout(timer);
      socket.off("connect");
      socket.off("connect_error");
      resolve();
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timer);
      socket.off("connect");
      socket.off("connect_error");
      reject(error);
    });
  });
};

/**
 * Emit socket event and wait for response
 * @param {Object} socket - Socket.IO client
 * @param {string} eventName - Event to emit
 * @param {any} data - Data to send
 * @param {string} responseEvent - Event to wait for
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<any>} Response data
 */
export const emitAndWait = (socket, eventName, data, responseEvent, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(responseEvent);
      reject(new Error(`Timeout waiting for response: ${responseEvent}`));
    }, timeout);

    socket.on(responseEvent, (response) => {
      clearTimeout(timer);
      socket.off(responseEvent);
      resolve(response);
    });

    socket.emit(eventName, data);
  });
};

// ============================================================================
// DELAY HELPERS
// ============================================================================

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in milliseconds
 * @returns {Promise<any>} Function result
 */
export const retry = async (fn, maxRetries = 3, initialDelay = 100) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(initialDelay * Math.pow(2, i));
      }
    }
  }
  throw lastError;
};

// ============================================================================
// MOCK HELPERS
// ============================================================================

/**
 * Create a mock Socket.IO event emitter
 * @returns {Object} Mock emitter
 */
export const createMockSocketEmitter = () => {
  const listeners = {};

  return {
    on(event, callback) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    off(event) {
      delete listeners[event];
    },
    emit(event, data) {
      if (listeners[event]) {
        listeners[event].forEach((cb) => cb(data));
      }
    },
    getListeners(event) {
      return listeners[event] || [];
    },
  };
};

/**
 * Create a mock request object
 * @param {Object} overrides - Property overrides
 * @returns {Object} Mock request
 */
export const createMockRequest = (overrides = {}) => {
  return {
    headers: {},
    body: {},
    params: {},
    query: {},
    user: null,
    ...overrides,
  };
};

/**
 * Create a mock response object
 * @returns {Object} Mock response
 */
export const createMockResponse = () => {
  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
    send(data) {
      this.sendData = data;
      return this;
    },
    sendStatus(code) {
      this.statusCode = code;
      return this;
    },
  };
  return response;
};

export default {
  // Factories
  createTestUser,
  createTestUsers,
  createTestGroup,
  createTestMessage,

  // JWT & Auth
  generateTestToken,
  generateExpiredToken,
  generateMalformedToken,
  hashPassword,
  comparePassword,

  // Requests
  getAuthHeaders,
  createSignupPayload,
  createLoginPayload,

  // Assertions
  assertValidUserResponse,
  assertValidAuthResponse,
  assertValidMessageResponse,
  assertValidGroupResponse,

  // MongoDB
  createObjectId,
  isValidObjectId,

  // Socket.IO
  waitForSocketEvent,
  waitForSocketConnection,
  emitAndWait,

  // Utilities
  sleep,
  retry,

  // Mocks
  createMockSocketEmitter,
  createMockRequest,
  createMockResponse,
};
