module.exports = {
  preset: undefined,
  transform: {
    '^.+\\.(ts|tsx)$': '<rootDir>/jest.transform.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testEnvironment: 'node',
}
