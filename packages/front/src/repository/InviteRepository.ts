import { Invite } from '../../../../types/__project_defs/Invite';
import { invitesCollectionName } from '../constants';
import { nanoid } from 'nanoid/non-secure';
import { FirebaseFirestore, DocumentReference } from '@firebase/firestore-types';

export class InviteRepository {
    constructor(private readonly firestore: FirebaseFirestore) {}

    async save(invite: Invite): Promise<void> {
        const isNew = typeof invite.id !== 'string';

        const docRef: DocumentReference<any> = isNew
            ? this.firestore.collection(invitesCollectionName).doc(nanoid())
            : this.firestore.collection(invitesCollectionName).doc(invite.id);

        invite.id = docRef.id;

        if (isNew) {
            invite.createdAt = new Date();
        }

        return docRef.set({ ...invite }, { merge: true });
    }

    async delete(invite: Invite): Promise<void> {
        const docRef = window.fireDB.collection(invitesCollectionName).doc(invite.id);

        return docRef.delete();
    }

    /**
     * Often used to check if the number of invites in x day reached the limit to some email
     *
     * @param email
     * @param date
     */
    async findByEmailAndDate(email: string, date = new Date()): Promise<Invite[]> {
        date.setHours(0, 0, 0, 0);
        const copiedDate = new Date(date.getTime());
        copiedDate.setHours(23, 59, 59, 999);

        const query = await window.fireDB
            .collection(invitesCollectionName)
            .where('email' as keyof Invite, '==', email)
            .where('createdAt' as keyof Invite, '>=', date)
            .where('createdAt' as keyof Invite, '<=', copiedDate)
            .get();

        return query.docs.map(doc => doc.data() as Invite);
    }
}
