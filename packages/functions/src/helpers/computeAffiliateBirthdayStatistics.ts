import { IAffiliate } from '../../../../types/__project_defs/IAffiliate';
import admin from 'firebase-admin';
import * as firebaseAdmin from 'firebase-admin';
import { FirebaseSearchableDateObject } from 'front/src/utils/dateUtils';
import { statisticsCollectionName } from 'front/src/constants';

export async function computeAffiliateBirthdayStatistics(params: {
    affiliate: IAffiliate;
    isDeleted?: boolean;
    oldAffiliate?: IAffiliate;
}) {
    const { affiliate, isDeleted, oldAffiliate } = params;
    const currentAffiliateBirthdayMonth = (affiliate.birthday as FirebaseSearchableDateObject).month;

    const increment = firebaseAdmin.firestore.FieldValue.increment(1);
    const decrement = firebaseAdmin.firestore.FieldValue.increment(-1);

    const compute = async (month: number, operation: 'increment' | 'decrement') => {
        await admin
            .firestore()
            .collection(statisticsCollectionName)
            .doc('birthdays')
            .set({ [month]: operation === 'increment' ? increment : decrement }, { merge: true });
    };

    if (isDeleted) {
        // affiliate deleted
        await compute(currentAffiliateBirthdayMonth, 'decrement');
    } else if (oldAffiliate === undefined) {
        // affiliate created
        await compute(currentAffiliateBirthdayMonth, 'increment');
    } else if (
        (affiliate.birthday as FirebaseSearchableDateObject).month !== (oldAffiliate.birthday as FirebaseSearchableDateObject).month
    ) {
        // affiliate birthday updated
        await compute((oldAffiliate.birthday as FirebaseSearchableDateObject).month, 'decrement');
        await compute(currentAffiliateBirthdayMonth, 'increment');
    }
}
