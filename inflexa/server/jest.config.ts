import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFilesAfterSetup: [],
  globalSetup: '<rootDir>/tests/setup.ts',
  globalTeardown: '<rootDir>/tests/teardown.ts',
  testTimeout: 60000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  moduleFileExtensions: ['ts', 'js', 'json'],
};

export default config;
