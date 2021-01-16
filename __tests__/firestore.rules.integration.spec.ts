import * as firebase from '@firebase/rules-unit-testing';
import {
    affiliatesCollectionName,
    attachmentsCollectionName,
    firebaseConfigJs,
    invitesCollectionName,
    occupationCollectionName,
    statisticsCollectionName,
} from 'front/src/constants';
import { nanoid } from 'nanoid/non-secure';
import pWaitFor from 'p-wait-for';
import faker from 'faker';
import { ROLES } from 'front/src/enums/ROLES';
import { FirebaseFirestore } from '@firebase/firestore-types';
import { integrationTestTimeout } from './testUtils/appTestUtils';
import { clearFirestoreSync } from './testUtils/firebaseTestUtils';
import { createFakeAffiliate, createFakeOccupation } from './testUtils/dumbData';

interface AuthObj {
    uid: string;
    email: string;
    role: string | ROLES;
    email_verified: boolean;
}

interface DBOptions {
    auth: Partial<AuthObj>;
}

function authFactory(partialAuth?: Partial<AuthObj>): AuthObj {
    return {
        uid: partialAuth?.uid || faker.internet.userName(),
        email: partialAuth?.email || faker.internet.email(),
        role: partialAuth?.role || ROLES.CONTENT_EDITOR,
        email_verified: partialAuth?.email_verified || true,
    };
}

function editorDbFactory(options?: DBOptions): FirebaseFirestore {
    return firebase
        .initializeTestApp({
            projectId: firebaseConfigJs.projectId,
            auth: authFactory(options?.auth || { role: ROLES.CONTENT_EDITOR }),
        })
        .firestore();
}

function adminDbFactory(options?: DBOptions): FirebaseFirestore {
    return firebase
        .initializeTestApp({
            projectId: firebaseConfigJs.projectId,
            auth: authFactory(options?.auth || { role: ROLES.ADMINISTRATOR }),
        })
        .firestore();
}

function anonymousDbFactory(options?: DBOptions): FirebaseFirestore {
    return firebase
        .initializeTestApp({
            projectId: firebaseConfigJs.projectId,
            auth: authFactory({ role: 'xxx' }),
        })
        .firestore();
}

beforeEach(async () => {
    await clearFirestoreSync();
});

test('statistics collection must be read-only', async () => {
    const db = editorDbFactory();

    const doc = db.collection(statisticsCollectionName).doc(nanoid());
    await firebase.assertFails(doc.set({ somestats: 'deny' }));

    await firebase.assertSucceeds(doc.get());
});

test('Only Admins and Editors can create an Occupation', async () => {
    const anonDB = anonymousDbFactory();
    const testDoc = anonDB.collection(occupationCollectionName).doc(nanoid());
    await firebase.assertFails(testDoc.set({ oin: 'tatapaum?' }));

    const editorDb = editorDbFactory();

    const editorTestDoc = editorDb.collection(occupationCollectionName).doc(nanoid());
    await firebase.assertSucceeds(editorTestDoc.set({ oin: 'tatapaum?' }));

    const adminDb = adminDbFactory();

    const adminTestDoc = adminDb.collection(occupationCollectionName).doc(nanoid());
    await firebase.assertSucceeds(adminTestDoc.set({ oin: 'tatapaum?' }));
});

test('Only Admins and Editors can create an Affiliate', async () => {
    const anonDB = anonymousDbFactory();
    const anonymousTestDoc = anonDB.collection(affiliatesCollectionName).doc(nanoid());
    await firebase.assertFails(anonymousTestDoc.set(createFakeAffiliate()));

    const adminDb = adminDbFactory();

    const adminTestDoc = adminDb.collection(affiliatesCollectionName).doc(nanoid());
    await firebase.assertSucceeds(adminTestDoc.set(createFakeAffiliate()));

    const editorDb = editorDbFactory();

    const editorTestDoc = editorDb.collection(affiliatesCollectionName).doc(nanoid());
    await firebase.assertSucceeds(editorTestDoc.set(createFakeAffiliate()));
});

test('Only Admins and Editors can create an attachment', async () => {
    const db = anonymousDbFactory();
    const anonymousTestDoc = db.collection(attachmentsCollectionName).doc(nanoid());
    await firebase.assertFails(anonymousTestDoc.set({ content: 'nothing' }));

    const adminDb = adminDbFactory();

    const adminTestDoc = adminDb.collection(attachmentsCollectionName).doc(nanoid());
    const occupation = await adminDb.collection(occupationCollectionName).doc(nanoid());
    await occupation.set({ foo: 'bar' });

    await firebase.assertSucceeds(adminTestDoc.set({ id: nanoid(), entityType: occupationCollectionName, entityId: occupation.id }));

    const editorDb = editorDbFactory();

    const editorTestDoc = editorDb.collection(attachmentsCollectionName).doc(nanoid());
    await firebase.assertSucceeds(editorTestDoc.set({ id: nanoid(), entityType: occupationCollectionName, entityId: occupation.id }));
});

test(
    'Orphan attachments should be removed after the parent is removed',
    async () => {
        const editorDb = editorDbFactory();

        const occupation = createFakeOccupation({ id: nanoid() });
        const occupationDoc = editorDb.collection(occupationCollectionName).doc(occupation.id);
        await occupationDoc.set(occupation);

        const attachment = editorDb.collection(attachmentsCollectionName).doc(nanoid());
        await firebase.assertSucceeds(attachment.set({ id: nanoid(), entityType: occupationCollectionName, entityId: occupation.id }));

        await firebase.assertSucceeds(occupationDoc.delete());

        expect(
            await pWaitFor(async () => !(await editorDb.collection(attachmentsCollectionName).doc(attachment.id).get()).exists, {
                timeout: integrationTestTimeout / 2,
            })
        ).toBeUndefined();
    },
    integrationTestTimeout
);

test('Attachments should not be appended to nonexistent entities', async () => {
    const editorDb = editorDbFactory();
    const occupationId = nanoid();
    const attachment = editorDb.collection(attachmentsCollectionName).doc(occupationId);

    await firebase.assertFails(attachment.set({ foo: 'bar' }));

    await firebase.assertFails(attachment.set({ id: nanoid(), entityType: occupationCollectionName, entityId: occupationId }));

    const occupation = editorDb.collection(occupationCollectionName).doc(occupationId);
    await occupation.set({ foo: 'bar' });

    await firebase.assertSucceeds(attachment.set({ id: nanoid(), entityType: occupationCollectionName, entityId: occupationId }));

    await occupation.delete();

    await firebase.assertFails(attachment.set({ id: nanoid(), entityType: occupationCollectionName, entityId: occupationId }));
});

test('Administrator can send an invite', async () => {
    const editorDb = editorDbFactory();
    const editorInviteDoc = editorDb.collection(invitesCollectionName).doc();
    await firebase.assertFails(editorInviteDoc.set({ foo: 'bar' }));

    const adminDb = adminDbFactory();
    const adminInviteDoc = adminDb.collection(invitesCollectionName).doc();
    await firebase.assertSucceeds(adminInviteDoc.set({ foo: 'bar' }));
});

test('cannot allow insertions on non-whitelisted collections', async () => {
    const db = editorDbFactory();

    const doc = db.collection('some-collection').doc('xxx');
    await firebase.assertFails(doc.set({ mainha: true }));
});

afterAll(async () => await clearFirestoreSync(), integrationTestTimeout);
