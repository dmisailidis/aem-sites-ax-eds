module.exports = {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  // Increase timeout for slower tests
  testTimeout: 10000,
  // Detect open handles that cause "Jest worker" errors
  detectOpenHandles: true,
  // Clear mocks between tests
  clearMocks: true,
  // Don't isolate modules, which can cause problems with mocks
  resetModules: false,
};
