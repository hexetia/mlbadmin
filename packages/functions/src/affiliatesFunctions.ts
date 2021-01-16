import * as functions from 'firebase-functions';
import { affiliatesCollectionName, occupationCollectionName } from 'front/src/constants';
import { IAffiliate } from '../../../types/__project_defs/IAffiliate';
import { computeAffiliateBirthdayStatistics } from './helpers/computeAffiliateBirthdayStatistics';
import * as firebaseAdmin from 'firebase-admin';
import { deleteAllAttachmentsFromEntity } from './index';
import { computeGeneralStatistics, GeneralStaticsEvent } from './helpers/staticsCollectionUtils';

const db = firebaseAdmin.firestore();

export enum AffiliateEvent {
    CREATE_AFFILIATE = 1,
    UPDATE_AFFILIATE = 2,
    DELETE_AFFILIATE = 3,
}

/**
 * Compute statics about number of affiliates on system and number of affiliates on each occupation
 */
export const onCreateAffiliate = functions
    .runWith({ memory: '128MB' })
    .firestore.document(`${affiliatesCollectionName}/{filiadoID}`)
    .onCreate(async (filiadoDocSnapshot, context) => {
        const affiliateData = filiadoDocSnapshot.data() as IAffiliate;

        await computeGeneralStatistics(GeneralStaticsEvent.CREATE_AFFILIATE);
        await computeAffiliateBirthdayStatistics({ affiliate: affiliateData });
        await computeAffiliateOccupationCorrelationStatistics(AffiliateEvent.CREATE_AFFILIATE, affiliateData);
    });

/**
 * Update statistics
 */
export const onUpdateAffiliate = functions
    .runWith({ memory: '128MB' })
    .firestore.document(`${affiliatesCollectionName}/{filiadoID}`)
    .onUpdate(async (filiadoDocChangeSnapshot, context) => {
        const beforeFiliadoData = filiadoDocChangeSnapshot.before.data() as IAffiliate;
        const afterFiliadoData = filiadoDocChangeSnapshot.after.data() as IAffiliate;

        await computeAffiliateBirthdayStatistics({ affiliate: afterFiliadoData, oldAffiliate: beforeFiliadoData });
        await computeAffiliateOccupationCorrelationStatistics(AffiliateEvent.UPDATE_AFFILIATE, beforeFiliadoData, afterFiliadoData);
    });

/**
 * Update statistics
 */
export const onDeleteAffiliate = functions
    .runWith({ memory: '128MB' })
    .firestore.document(`${affiliatesCollectionName}/{filiadoID}`)
    .onDelete(async (filiadoDocSnapshot, context) => {
        const filiadoData = filiadoDocSnapshot.data() as IAffiliate;

        await computeGeneralStatistics(GeneralStaticsEvent.DELETE_AFFILIATE);
        await computeAffiliateOccupationCorrelationStatistics(AffiliateEvent.DELETE_AFFILIATE, filiadoData);
        await computeAffiliateBirthdayStatistics({ affiliate: filiadoData, isDeleted: true });
        await deleteAllAttachmentsFromEntity(filiadoDocSnapshot.id);
    });

async function computeAffiliateOccupationCorrelationStatistics(
    affiliateEvent: AffiliateEvent,
    affiliate: IAffiliate,
    updatedAffiliate?: IAffiliate
) {
    const increment = firebaseAdmin.firestore.FieldValue.increment(1);
    const decrement = firebaseAdmin.firestore.FieldValue.increment(-1);

    // todo refactor that haduken
    if (affiliateEvent === AffiliateEvent.CREATE_AFFILIATE) {
        if (affiliate.occupationId !== '') {
            const ocupacaoRef = await db.collection(occupationCollectionName).doc(affiliate.occupationId!);
            if ((await ocupacaoRef.get()).exists) {
                ocupacaoRef.update({ totalAffiliates: increment });
            }
        }
    } else if (affiliateEvent === AffiliateEvent.UPDATE_AFFILIATE) {
        if (affiliate.occupationId !== updatedAffiliate!.occupationId) {
            if (affiliate.occupationId !== '') {
                const ocupacaoRef = await db.collection(occupationCollectionName).doc(affiliate.occupationId);
                if ((await ocupacaoRef.get()).exists) {
                    ocupacaoRef.update({ totalAffiliates: decrement });
                }
            }

            if (updatedAffiliate!.occupationId !== '') {
                const ocupacaoRef = await db.collection(occupationCollectionName).doc(updatedAffiliate!.occupationId);
                if ((await ocupacaoRef.get()).exists) {
                    ocupacaoRef.update({ totalAffiliates: increment });
                }
            }
        }
    } else if (affiliateEvent === AffiliateEvent.DELETE_AFFILIATE) {
        if (affiliate.occupationId !== '') {
            const ocupacaoRef = await db.collection(occupationCollectionName).doc(affiliate.occupationId);
            if ((await ocupacaoRef.get()).exists) {
                ocupacaoRef.update({ totalAffiliates: decrement });
            }
        }
    } else {
        throw new Error('Affiliate event cannot be handled because its not implemented');
    }
}
