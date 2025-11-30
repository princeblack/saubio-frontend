import type { Config } from 'jest';

const config: Config = {
  displayName: 'saubio-frontend',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleNameMapper: {
    '^@saubio/models(.*)$': '<rootDir>/libs/models/src$1',
    '^@saubio/utils(.*)$': '<rootDir>/libs/utils/src$1',
    '^@saubio/config(.*)$': '<rootDir>/libs/config/src$1',
    '^@saubio/ui(.*)$': '<rootDir>/libs/ui/src$1',
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}']
};

export default config;
