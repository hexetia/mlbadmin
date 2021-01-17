import { IAttachment } from '../../../../types/__project_defs/IAttachment';
import { attachmentsCollectionName } from '../constants';
import type firebase from 'firebase/app';

export class AttachmentRepository {
    static async findById(id: string): Promise<IAttachment> {
        const docRef = await window.fireDB.collection(attachmentsCollectionName).doc(id).get();

        return docRef.data() as IAttachment;
    }

    static async save(attachment: IAttachment & { name_lowercase?: string }): Promise<IAttachment> {
        const isNew = typeof attachment.id !== 'string';

        const docRef: firebase.firestore.DocumentReference<any> = isNew
            ? window.fireDB.collection(attachmentsCollectionName).doc()
            : window.fireDB.collection(attachmentsCollectionName).doc(attachment.id);

        // por algum motivo o docRef.id não se mantém igual após começar o upload dos anexos
        // vou manter o id aqui e não me pergunte o porque sacaralha muda
        attachment.id = docRef.id;

        await docRef.set(attachment, { merge: true });

        return attachment;
    }

    static async delete(attachment: IAttachment): Promise<void> {
        await window.fireDB.collection(attachmentsCollectionName).doc(attachment.id).delete();
    }

    static async deleteById(attachmentId: string): Promise<void> {
        await window.fireDB.collection(attachmentsCollectionName).doc(attachmentId).delete();
    }
}
