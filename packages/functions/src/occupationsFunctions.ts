import * as functions from 'firebase-functions';
import { affiliatesCollectionName, occupationCollectionName } from 'front/src/constants';
import { computeGeneralStatistics, deleteAllAttachmentsFromEntity, GeneralStaticsEvent } from './index';
import { IOccupation } from '../../../types/__project_defs/IOccupation';
import { IAffiliate } from '../../../types/__project_defs/IAffiliate';
import * as firebaseAdmin from 'firebase-admin';

const db = firebaseAdmin.firestore();

/**
 * Compute general statistics
 */
export const onCreateOccupation = functions
    .runWith({ memory: '128MB' })
    .firestore.document(`${occupationCollectionName}/{occupationId}`)
    .onCreate(async () => {
        await computeGeneralStatistics(GeneralStaticsEvent.CREATE_OCCUPATION);
    });

/**
 * - Compute general statistics
 * - Remove occupation relation on affiliates
 * - Delete all attachments attached to that Occupation
 */
export const onDeleteOccupation = functions
    .runWith({ memory: '128MB', timeoutSeconds: 540 })
    .firestore.document(`${occupationCollectionName}/{occupationId}`)
    .onDelete(async docSnapshot => {
        await computeGeneralStatistics(GeneralStaticsEvent.DELETE_OCCUPATION);
        await removeOcupacaoFromFiliados(docSnapshot.data() as IOccupation);
        await deleteAllAttachmentsFromEntity(docSnapshot.id);
    });

async function removeOcupacaoFromFiliados(occupation: IOccupation) {
    console.log('removeOcupacaoFromFiliados: occupationId', occupation.id);
    const ref = await db.collection(affiliatesCollectionName).where('occupationId', '==', occupation.id).get();
    // streaming a huge amount of docs cause a lot of errors on firebase backend,
    // maybe because of the large amount of parallelization required to processes thousands of docs at same time
    for (let doc of ref.docs) {
        try {
            if ((doc.data() as IAffiliate).occupationId === occupation.id) {
                await doc.ref.set({ occupationId: '' }, { merge: true });
            }
        } catch (e) {}
    }

    return;
}
