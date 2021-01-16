module.exports = {
    setupFilesAfterEnv: [__dirname + '/__tests__/setupTests.ts'],
    testMatch: ['**/__tests__/**/?(*.)+(spec|test).[tj]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)', '!**/*.integration.spec.ts'],
    testEnvironment: 'node',
};
