module.exports = {
    setupFilesAfterEnv: [__dirname + '/__tests__/setupTests.ts'],
    testMatch: ['**/*.integration.spec.ts'],
    testEnvironment: 'node',
};
