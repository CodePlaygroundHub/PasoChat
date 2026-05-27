/**
 * Jest setup file that runs after the test environment is configured
 * Used for global test utilities and configuration
 */

import { jest } from "@jest/globals";

// Set a longer timeout for integration tests
jest.setTimeout(15000);

// Global error handler for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Suppress console logs in tests (enable when needed)
// global.console.log = jest.fn();

export {};