import * as firebaseAdmin from 'firebase-admin';
import * as firebaseTest from '@firebase/rules-unit-testing';
import { withFunctionTriggersDisabled } from '@firebase/rules-unit-testing';
import { FirebaseFirestore } from '@firebase/firestore-types';
import { firebaseProjectId } from './firebaseProjectId';

export const fireAdmin = firebaseAdmin.apps.length
    ? firebaseAdmin.app()
    : firebaseAdmin.initializeApp({ projectId: firebaseProjectId, credential: firebaseAdmin.credential.applicationDefault() });

export const fireTestApp = firebaseTest.initializeAdminApp({ projectId: firebaseProjectId });

export async function deleteAllUsers() {
    const usersResult = await fireAdmin.auth().listUsers();
    for (let user of usersResult.users) {
        await fireAdmin.auth().deleteUser(user.uid);
    }
}

export async function withFirestoreAdmin<T>(fn: (firestore: FirebaseFirestore) => T): Promise<T> {
    const firestore = fireTestApp.firestore();
    return fn(firestore);
}

// I think that the issue is that the disableBakcgroundTriggers endpoint api is async, and putting a await in
// clearFirestoreData is useless, since it don't be awaited
// the withFunctionsTriggersDisable is working fine, the problem is the async endpoint
// I mande an inhouse api to clear the firestore data that is sync and can be awaited if needed
export async function clearFirestoreSync() {
    await withFunctionTriggersDisabled(async () => {
        const snapshot = await fireAdmin.firestore().listCollections();

        for (let snap of snapshot) {
            const collection = (snap as any)['_queryOptions'].collectionId;
            const collectionQuery = await fireAdmin.firestore().collection(collection).get();
            for (let doc of collectionQuery.docs) {
                await fireAdmin.firestore().collection(collection).doc(doc.id).delete();
            }
        }
    });
}
