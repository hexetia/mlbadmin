export const mockSendEmail = jest.fn(() => {
    return { promise: () => Promise.resolve({ MessageId: Math.random() }) };
});
