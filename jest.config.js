module.exports = {
    transform: {
        '^.+\\.js$': '@sucrase/jest-plugin'
    },
    testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/src/**/*.test.js'],
    transformIgnorePatterns: ['/node_modules/'],
    rootDir: '.',
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js']
};
