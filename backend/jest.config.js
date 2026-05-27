export default {
  testEnvironment: "node",
  transform: {},
  verbose: true,
  testTimeout: 15000,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!src/seeds/**",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
  ],
  testMatch: [
    "**/__tests__/**/*.js",
    "**/?(*.)+(spec|test).js",
  ],
  setupFilesAfterEnv: ["<rootDir>/test/setupTests.js"],
  maxWorkers: "50%",
};