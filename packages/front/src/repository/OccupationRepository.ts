import type { IOccupation } from '../../../../types/__project_defs/IOccupation';
import { storeImageIfNecessary } from './storeImageIfNecessary';
import { occupationCollectionName } from '../constants';
import { normalizeText } from 'normalize-text';
import { FirebaseFirestore, DocumentReference } from '@firebase/firestore-types';

export class OccupationRepository {
    constructor(private readonly firestore: FirebaseFirestore) {}

    async save(occupation: IOccupation & { name_lowercase?: string }): Promise<IOccupation> {
        const isNew = typeof occupation.id === 'undefined';

        if (isNew) {
            occupation.totalAffiliates = 0;
            occupation.createdDate = new Date();
        }

        // prettier-ignore
        const docRef: DocumentReference<any> = isNew
            ? this.firestore.collection(occupationCollectionName).doc()
            : this.firestore.collection(occupationCollectionName).doc(occupation.id);

        // por algum motivo o docRef.id não se mantém igual após começar o upload dos anexos
        // vou manter o id aqui e não me pergunte o porque sacaralha muda
        occupation.id = docRef.id;

        await storeImageIfNecessary(occupation, 'photo', `${occupationCollectionName}/${occupation.id}/public/photo.`);

        occupation.changedDate = new Date();

        occupation.name_lowercase = normalizeText(occupation.name.toLowerCase());
        await docRef.set(occupation, { merge: true });

        return occupation;
    }

    async findById(occupationId: string): Promise<IOccupation> {
        const docRef = await this.firestore.collection(occupationCollectionName).doc(occupationId).get();

        if (!docRef.exists) {
            throw new Error(`ocupação com id ${occupationId} não encontrada`);
        }

        return docRef.data() as IOccupation;
    }

    async delete(occupation: IOccupation): Promise<void> {
        await this.firestore.collection(occupationCollectionName).doc(occupation.id).delete();
    }
}
