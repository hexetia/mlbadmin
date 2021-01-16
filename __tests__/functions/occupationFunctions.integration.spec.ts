import { clearFirestoreSync, fireTestApp } from '../testUtils/firebaseTestUtils';
import { OccupationRepository } from 'front/src/repository/OccupationRepository';
import { AffiliateRepository } from 'front/src/repository/AffiliateRepository';
import waitForExpect from 'wait-for-expect';
import { statisticsCollectionName } from 'front/src/constants';
import { integrationTestTimeout } from '../testUtils/appTestUtils';
import { createFakeAffiliate, createFakeOccupation } from '../testUtils/dumbData';

beforeEach(async () => {
    await clearFirestoreSync();
}, integrationTestTimeout);

const db = fireTestApp.firestore();

test(
    'onCreateOccupation',
    async () => {
        const occupationRepository = new OccupationRepository(db);

        await occupationRepository.save(createFakeOccupation());

        // general statistics
        await waitForExpect(async () => {
            expect((await db.collection(statisticsCollectionName).doc('general').get()).data()!.occupations).toBe(1);
        });
    },
    integrationTestTimeout
);

test(
    'onDeleteOccupation',
    async () => {
        const occupationRepository = new OccupationRepository(db);
        const affiliateRepository = new AffiliateRepository(db);

        const occupation = await occupationRepository.save(createFakeOccupation());

        const affiliate = await affiliateRepository.save(createFakeAffiliate(occupation));

        expect(affiliate.occupationId).toBe(occupation.id);

        // general statistics
        await waitForExpect(async () => {
            expect((await db.collection(statisticsCollectionName).doc('general').get()).data()!.occupations).toBe(1);
        });

        // affiliate occupation removed
        await waitForExpect(async () => {
            expect((await occupationRepository.findById(occupation.id!))!.totalAffiliates).toBe(1);
        });

        await occupationRepository.delete(occupation);

        // general statistics
        await waitForExpect(async () => {
            expect((await db.collection(statisticsCollectionName).doc('general').get()).data()!.occupations).toBe(0);
        });

        // affiliate occupation removed
        await waitForExpect(async () => {
            expect((await affiliateRepository.findById(affiliate.id!)).occupationId).toBe('');
        });
    },
    integrationTestTimeout
);
