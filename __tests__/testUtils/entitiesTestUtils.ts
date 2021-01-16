import { IAffiliate } from '../../types/__project_defs/IAffiliate';
import { AffiliateRepository } from 'front/src/repository/AffiliateRepository';
import puppeteer from 'puppeteer';
import waitForExpect from 'wait-for-expect';
import { arrayNItems, integrationTestTimeout } from './appTestUtils';
import { withFirestoreAdmin } from './firebaseTestUtils';
import { IOccupation } from '../../types/__project_defs/IOccupation';
import { occupationCollectionName } from 'front/src/constants';
import { createFakeAffiliate, createFakeOccupation } from './dumbData';

export const expectShowedAffiliatesNumber = async (page: puppeteer.Page, count: number): Promise<number> => {
    await waitForExpect(async () => {
        const nItems = await page.evaluate(async () => document.querySelectorAll('[data-testid="affiliateListItem"]').length);

        return expect(nItems).toBe(count);
    }, integrationTestTimeout / 2);

    return count;
};

export async function storeNAffiliates(numberOf: number, partial?: Partial<IAffiliate>): Promise<IAffiliate[]> {
    const affiliates: IAffiliate[] = arrayNItems(numberOf).map(() => {
        return createFakeAffiliate(undefined, partial) as IAffiliate;
    });

    const stored: IAffiliate[] = [];

    await withFirestoreAdmin(async firestore => {
        const repository = new AffiliateRepository(firestore!);
        for (let affiliate of affiliates) {
            stored.push(await repository.save(affiliate));
        }
    });

    return stored;
}

export async function storeNOccupations(numberOf: number, partialOccupation?: Partial<IOccupation>) {
    const occupations: IOccupation[] = arrayNItems(numberOf).map(() => {
        return createFakeOccupation() as IOccupation;
    });

    await withFirestoreAdmin(async firestore => {
        for (let occupation of occupations) {
            await firestore.collection(occupationCollectionName).doc(occupation.id).set(occupation);
        }
    });
}
