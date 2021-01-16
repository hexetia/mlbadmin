import type { IAffiliate } from '../../../../types/__project_defs/IAffiliate';
import { storeImageIfNecessary } from './storeImageIfNecessary';
import { normalizeText } from 'normalize-text';
import { formatCPF } from '@brazilian-utils/brazilian-utils';
import { makeSearchableDate } from '../utils/dateUtils';
import { affiliatesCollectionName } from '../constants';
import { FirebaseFirestore, DocumentReference } from '@firebase/firestore-types';
import { notEmptyStr } from '../utils/StringUtils';
import { IAffiliateEdit } from '../../../../types/__project_defs/IAffiliateEdit';
import { isNullOrUndefined } from '../utils/valuesUtils';
import pick from 'object.pick';
import { IAddress } from '../../../../types/__project_defs/IAddress';

export class AffiliateRepository {
    constructor(private readonly firestore: FirebaseFirestore) {}

    async findById(id: string): Promise<IAffiliate> {
        const docRef = await this.firestore.collection(affiliatesCollectionName).doc(id).get();

        return docRef.data() as IAffiliate;
    }

    async save(affiliate: IAffiliate & { name_lowercase?: string }): Promise<IAffiliate> {
        const isNew = typeof affiliate.id === 'undefined';

        if (isNew) {
            affiliate.createdAt = new Date();
        }

        // prettier-ignore
        const docRef: DocumentReference<any> = isNew
			? this.firestore.collection(affiliatesCollectionName).doc()
			: this.firestore.collection(affiliatesCollectionName).doc(affiliate.id);

        // por algum motivo o docRef.id não se mantém igual após começar o upload dos anexos
        // vou manter o id aqui e não me pergunte o porque sacaralha muda
        affiliate.id = docRef.id;

        await storeImageIfNecessary(affiliate, 'photo', `affiliates/${affiliate.id}/docs/photo.`);

        if (!isNullOrUndefined((affiliate as IAffiliateEdit).occupation)) {
            affiliate.occupationId = (affiliate as IAffiliateEdit).occupation.id;
        } else if (isNullOrUndefined(affiliate.occupationId)) {
            affiliate.occupationId = '';
        }

        delete (affiliate as IAffiliateEdit).occupation;

        if (affiliate.useOccupationAddress && notEmptyStr(affiliate.occupationId)) {
            const partialAddress = pick(affiliate.address, ['number', 'complement']);
            affiliate.address = partialAddress as IAddress;
        }

        if (affiliate.cpf !== '') {
            affiliate.cpf = formatCPF(affiliate.cpf);
        }

        if (typeof affiliate.birthday === 'string') {
            affiliate.birthday = makeSearchableDate(affiliate.birthday);
        }

        affiliate.changedAt = new Date();
        affiliate.name_lowercase = normalizeText(affiliate.name.toLowerCase());
        await docRef.set(affiliate, { merge: true });

        return affiliate;
    }

    async delete(affiliate: IAffiliate): Promise<void> {
        await this.firestore.collection(affiliatesCollectionName).doc(affiliate.id).delete();
    }
}
