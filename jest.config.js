
module.exports = {
   // Automatically clear mock calls and instances between every test
   clearMocks: true,

   // Indicates whether the coverage information should be collected while executing the test
   collectCoverage: true,

   // An array of glob patterns indicating a set of files for which coverage information should be collected
   collectCoverageFrom: ["<rootDir>/src/**/*.ts"],

   // The directory where Jest should output its coverage files
   coverageDirectory: "coverage",

   // Indicates which provider should be used to instrument code for coverage
   coverageProvider: "v8",

   // A list of reporter names that Jest uses when writing coverage reports
   coverageReporters: ["text-summary", "lcov"],

   // A preset that is used as a base for Jest's configuration
   preset: "ts-jest",

   // The paths to modules that run some code to configure or set up the testing environment before each test
   setupFiles: ["dotenv/config"],

   // The test environment that will be used for testing
   testEnvironment: "node",

   // The glob patterns Jest uses to detect test files
   testMatch: ["**/__tests__/**/*.test.ts"],
};
