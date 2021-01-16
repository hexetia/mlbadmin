import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { attachmentsCollectionName } from 'front/src/constants';
import { IAttachment } from '../../../types/__project_defs/IAttachment';

export const onDeleteAttachment = functions
    .runWith({ memory: '128MB', timeoutSeconds: 540 })
    .firestore.document(`${attachmentsCollectionName}/{id}`)
    .onDelete(async attachmentSnapshot => {
        const attachment = attachmentSnapshot.data() as IAttachment;

        return await deleteAttachmentFromStorage(attachment);
    });

export async function deleteAllAttachmentsFromEntity(entityID: string) {
    const queryRef = await admin
        .firestore()
        .collection(attachmentsCollectionName)
        .where('entityId' as keyof IAttachment, '==', entityID)
        .get();

    for (let docRef of queryRef.docs) {
        // delete doc will call onDeleteAttachment
        try {
            await docRef.ref.delete();
        } catch (ignore) {
            console.log('failed to delete attachment with id', docRef.id);
        }
    }

    return;
}

async function deleteAttachmentFromStorage(attachment: IAttachment) {
    if (process.env.FUNCTIONS_EMULATOR !== 'true') {
        try {
            await admin
                .storage()
                .bucket()
                .file(attachment.path as string)
                .delete();
        } catch (error) {
            console.log('failed to delete attachment', attachment.id, 'error ->', error.message);
        }
    } else {
        console.log(
            'tried to delete an attachment, the firebase storage emulator is not ready yet, @see https://github.com/firebase/firebase-tools/issues/1738'
        );
    }

    return;
}
