// jest.config.js
const nextJest = require('next/jest');

const nextConfig = {
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
};
module.exports.nextConfig = nextConfig;
const createJestConfig = nextJest(nextConfig);
// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '@/utilities/(.*)': '<rootDir>/utilities/$1',
    '@/lib/(.*)': '<rootDir>/lib/$1',
  },
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
};
module.exports.customJestConfig = customJestConfig;
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);