import { mockSendEmail } from '../testUtils/mock/mockAwsSes';

jest.mock('aws-sdk/clients/ses', () =>
    jest.fn(() => {
        return {
            sendEmail: mockSendEmail,
        };
    })
);

import { nanoid } from 'nanoid/non-secure';
import { ROLES } from 'front/src/enums/ROLES';
import { _onCreateInvite } from 'functions/src/invitesFunctions';
import { integrationTestTimeout } from '../testUtils/appTestUtils';
import { clearFirestoreSync } from '../testUtils/firebaseTestUtils';

beforeEach(async () => {
    mockSendEmail.mockClear();
    await clearFirestoreSync();
}, integrationTestTimeout);

afterEach(() => {
    mockSendEmail.mockClear();
});

afterAll(async () => {
    await clearFirestoreSync();
});

test(
    'Send email to invited users',
    async () => {
        const invite = {
            id: nanoid(),
            email: 'fake@gmail.com',
            role: ROLES.ADMINISTRATOR,
            createdBy: {
                email: 'godGrid@gmail.com',
                name: 'Shin Youngwoo',
            },
        };

        await _onCreateInvite({ data: () => invite } as any);

        expect(mockSendEmail).toBeCalledTimes(1);
    },
    integrationTestTimeout
);
