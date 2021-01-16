import * as firebaseAdmin from 'firebase-admin';
import when from 'when-expression';
import { affiliatesCollectionName, occupationCollectionName } from 'front/src/constants';

export enum GeneralStaticsEvent {
    CREATE_AFFILIATE = 1,
    DELETE_AFFILIATE = 2,
    CREATE_OCCUPATION = 3,
    DELETE_OCCUPATION = 4,
}
const db = firebaseAdmin.firestore();

export async function computeGeneralStatistics(eventType: GeneralStaticsEvent) {
    const increment = firebaseAdmin.firestore.FieldValue.increment(1);
    const decrement = firebaseAdmin.firestore.FieldValue.increment(-1);

    const fieldAndOperation = when(eventType)({
        [GeneralStaticsEvent.CREATE_AFFILIATE]: { field: affiliatesCollectionName, operation: increment },
        [GeneralStaticsEvent.DELETE_AFFILIATE]: { field: affiliatesCollectionName, operation: decrement },
        [GeneralStaticsEvent.CREATE_OCCUPATION]: { field: occupationCollectionName, operation: increment },
        [GeneralStaticsEvent.DELETE_OCCUPATION]: { field: occupationCollectionName, operation: decrement },
        else: false,
    });

    if (fieldAndOperation === false) {
        return;
    }

    const generalStatisticsDocRef = db.collection('statistics').doc('general');

    await generalStatisticsDocRef.set({ [fieldAndOperation.field]: fieldAndOperation.operation }, { merge: true });
}
