module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^auth/(.*)$': '<rootDir>/src/__mocks__/auth/$1',
    '^directory/(.*)$': '<rootDir>/src/__mocks__/directory/$1',
    '^memoryGame/(.*)$': '<rootDir>/src/__mocks__/memoryGame/$1',
    '^profile/(.*)$': '<rootDir>/src/__mocks__/profile/$1'
  },
  testTimeout: 10000
};
