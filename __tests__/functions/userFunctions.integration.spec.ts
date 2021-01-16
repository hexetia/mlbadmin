/**
 * @jest-environment node
 */
import type { auth as AuthType } from 'firebase-admin';
import { APP_ADMIN_EMAILS } from 'functions/src/helpers/env';
import { invitesCollectionName, usersCollectionName } from 'front/src/constants';
import { deleteAllUsers, fireAdmin, fireTestApp } from '../testUtils/firebaseTestUtils';
import deepMerge from 'deepmerge';
import waitForExpect from 'wait-for-expect';
import { randomInt } from 'crypto';
import { InviteRepository } from 'front/src/repository/InviteRepository';
import { ROLES } from 'front/src/enums/ROLES';
import { nanoid } from 'nanoid/non-secure';
import { _changeRole, _deleteUser } from 'functions/src/userFunctions';
import { Invite } from '../../types/__project_defs/Invite';
import { integrationTestTimeout } from '../testUtils/appTestUtils';

const administratorFunctionContext = {
    auth: {
        token: {
            email_verified: true,
            role: ROLES.ADMINISTRATOR,
        },
    },
};

beforeEach(async () => {
    await deleteAllUsers();
}, integrationTestTimeout);

test(
    'onCreateUser: Accounts created with unverified email should be automatically deleted',
    async () => {
        await createAccount({ email: APP_ADMIN_EMAILS[0], emailVerified: false });
        await waitForExpect(() => expect(fireAdmin.auth().getUserByEmail(APP_ADMIN_EMAILS[0])).rejects.toThrow('no user'));
    },
    integrationTestTimeout
);

test(
    'onCreateUser: Accounts created with unverified email should be automatically deleted',
    async () => {
        await createAccount({ email: APP_ADMIN_EMAILS[0], emailVerified: false });
        await waitForExpect(() => expect(fireAdmin.auth().getUserByEmail(APP_ADMIN_EMAILS[0])).rejects.toThrow('no user'));
    },
    integrationTestTimeout
);

test(
    'onCreateUser: Create user doc to track role after a successfully login',
    async () => {
        const firstAdministrator = await createAccount({ email: APP_ADMIN_EMAILS[0] });
        await waitForExpect(async () => {
            const query = await fireAdmin.firestore().collection(usersCollectionName).get();
            expect(query.size).toBe(1);
        });

        await waitForExpect(async () => {
            const user = await fireAdmin.auth().getUserByEmail(firstAdministrator.email!);
            return expect(user.customClaims?.role).toBe(ROLES.ADMINISTRATOR);
        });

        await createAccount({ email: APP_ADMIN_EMAILS[1] });
        await waitForExpect(async () => {
            const query = await fireAdmin.firestore().collection(usersCollectionName).get();
            expect(query.size).toBe(2);
        });

        // when a person without invite create an account/login the system should delete automatically that account
        // and clear data related to that account
        await createAccount({ email: 'nonadminemail@gmail.com' });
        await waitForExpect(() => expect(fireAdmin.auth().getUserByEmail('nonadminemail@gmail.com')).rejects.toThrow('no user'));
        // accounts that don't have invites should not create a doc in users collection
        await waitForExpect(async () => {
            const query = await fireAdmin.firestore().collection(usersCollectionName).get();
            expect(query.size).toBe(2);
        });
    },
    integrationTestTimeout
);

test(
    'onDeleteUser: User doc in users collection should be deleted as side-effect',
    async () => {
        const user = await createAccount({ email: APP_ADMIN_EMAILS[0], emailVerified: true });
        await fireAdmin.auth().deleteUser((await fireAdmin.auth().getUserByEmail(user.email!)).uid);
        await waitForExpect(async () =>
            expect((await fireAdmin.firestore().collection(usersCollectionName).where('email', '==', user.email).get()).empty).toBeTruthy()
        );
    },
    integrationTestTimeout
);

test(
    'Http changeRole should change user role',
    async () => {
        await createInvite({ email: 'fulano@gmail.com', role: ROLES.CONTENT_EDITOR });

        const user = await createAccount({ email: 'fulano@gmail.com' });

        await waitForExpect(async () =>
            expect(
                (await fireAdmin.firestore().collection(invitesCollectionName).where('email', '==', 'fulano@gmail.com').get()).empty
            ).toBeTruthy()
        );

        await _changeRole({ targetUID: user.uid, targetRole: ROLES.ADMINISTRATOR }, administratorFunctionContext);

        await waitForExpect(async () => {
            const user = await fireAdmin.auth().getUserByEmail('fulano@gmail.com');
            return expect(user.customClaims?.role).toBe(ROLES.ADMINISTRATOR);
        });
    },
    integrationTestTimeout
);

test(
    'Http deleteUser should user and clear user doc collection',
    async () => {
        await createInvite({ email: 'fulano@gmail.com', role: ROLES.ADMINISTRATOR });

        const user = await createAccount({ email: 'fulano@gmail.com' });

        await _deleteUser({ email: user.email! }, administratorFunctionContext);
        await waitForExpect(() => expect(fireAdmin.auth().getUserByEmail(user.email!)).rejects.toThrow('no user'));
    },
    integrationTestTimeout
);

/**
 * When user login an account is automatically created by firebase
 */
async function createAccount(partialUser: Partial<AuthType.UserRecord> = {}): Promise<AuthType.UserRecord> {
    const user: AuthType.UserRecord = deepMerge(
        {
            uid: nanoid(),
            customClaims: {},
            email: 'example@gmail.com',
            emailVerified: true,
            phoneNumber: `+5511${randomInt(1_1111_1111, 9_9999_9999).toString().padStart(9, '0')}`,
            displayName: 'John Doe',
            photoURL: 'http://www.example.com/12345678/photo.png',
            disabled: false,
        },
        partialUser
    );
    await fireAdmin.auth().createUser(user);

    return user;
}

async function createInvite(partialInvite: Partial<Invite> = {}) {
    const repository = new InviteRepository(fireTestApp.firestore());
    const invite = deepMerge(
        {
            id: nanoid(),
            createdAt: new Date(),
            role: ROLES.CONTENT_EDITOR,
            createdBy: {
                email: partialInvite.email!,
                name: 'Foo',
            },
        },
        partialInvite
    );

    await repository.save(invite);
}
