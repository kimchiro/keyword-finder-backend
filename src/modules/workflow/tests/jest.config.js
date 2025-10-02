module.exports = {
  displayName: "Workflow Module Tests",
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: [
    "**/*.(t|j)s",
    "!**/*.spec.ts",
    "!**/*.integration.spec.ts",
    "!**/node_modules/**",
  ],
  coverageDirectory: "../../../../coverage/workflow",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],
};
