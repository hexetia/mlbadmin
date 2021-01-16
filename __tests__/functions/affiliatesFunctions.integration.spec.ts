import { occupationCollectionName, statisticsCollectionName } from 'front/src/constants';
import waitForExpect from 'wait-for-expect';
import { clearFirestoreSync, fireTestApp } from '../testUtils/firebaseTestUtils';
import { AffiliateRepository } from 'front/src/repository/AffiliateRepository';
import { OccupationRepository } from 'front/src/repository/OccupationRepository';
import { integrationTestTimeout } from '../testUtils/appTestUtils';
import { createFakeAffiliate, createFakeOccupation } from '../testUtils/dumbData';

beforeEach(async () => {
    await clearFirestoreSync();
}, integrationTestTimeout);

afterAll(async () => {
    await clearFirestoreSync();
});

test(
    'onCreateAffiliate should compute statistics in statisticsCollection and Occupation doc',
    async () => {
        const db = fireTestApp.firestore();
        const occupationRepository = new OccupationRepository(db);
        const occupation = await occupationRepository.save(createFakeOccupation());
        const affiliateRepository = new AffiliateRepository(db);

        await affiliateRepository.save(createFakeAffiliate(occupation, { birthday: { day: 10, month: 10, year: 1990 } }));
        await affiliateRepository.save(createFakeAffiliate(occupation, { birthday: { day: 5, month: 5, year: 1990 } }));

        // general statistics
        await waitForExpect(async () => {
            expect((await db.collection(statisticsCollectionName).doc('general').get()).data()!.affiliates).toBe(2);
        }, 20_000);

        // birthdays statistics
        await waitForExpect(async () => {
            expect((await db.collection(statisticsCollectionName).doc('birthdays').get()).data()!['10']).toBe(1);
            expect((await db.collection(statisticsCollectionName).doc('birthdays').get()).data()!['5']).toBe(1);
        }, 20_000);

        await waitForExpect(async () => {
            expect((await db.collection(occupationCollectionName).doc(occupation.id).get()).data()!.totalAffiliates).toBe(2);
        }, 20_000);
    },
    integrationTestTimeout * 2
);

test(
    'onUpdateAffiliate after updating the occupation in affiliate, the statistics should be updated',
    async () => {
        const db = fireTestApp.firestore();
        const occupationRepository = new OccupationRepository(db);
        const occupation = await occupationRepository.save(createFakeOccupation());
        const occupationTwo = await occupationRepository.save(createFakeOccupation());

        const affiliateRepository = new AffiliateRepository(db);

        const affiliateOne = await affiliateRepository.save(
            createFakeAffiliate(occupation, { birthday: { day: 10, month: 10, year: 1990 } })
        );
        await affiliateRepository.save(createFakeAffiliate(occupation, { birthday: { day: 5, month: 5, year: 1990 } }));

        await waitForExpect(async () => {
            expect((await db.collection(occupationCollectionName).doc(occupation.id).get()).data()!.totalAffiliates).toBe(2);
            expect((await db.collection(occupationCollectionName).doc(occupationTwo.id).get()).data()!.totalAffiliates).toBe(0);
        });

        affiliateOne.occupationId = occupationTwo.id!;
        await affiliateRepository.save(affiliateOne);

        await waitForExpect(async () => {
            expect((await db.collection(occupationCollectionName).doc(occupation.id).get()).data()!.totalAffiliates).toBe(1);
            expect((await db.collection(occupationCollectionName).doc(occupationTwo.id).get()).data()!.totalAffiliates).toBe(1);
        });
    },
    integrationTestTimeout
);

test(
    'onDeleteAffiliate after updating the occupation in affiliate, the statistics should be updated',
    async () => {
        const db = fireTestApp.firestore();
        const occupationRepository = new OccupationRepository(db);
        const occupation = await occupationRepository.save(createFakeOccupation());

        const affiliateRepository = new AffiliateRepository(db);

        const affiliate = await affiliateRepository.save(createFakeAffiliate(occupation, { birthday: { day: 10, month: 10, year: 1990 } }));
        await affiliateRepository.save(createFakeAffiliate(occupation, { birthday: { day: 5, month: 5, year: 1990 } }));

        await affiliateRepository.delete(affiliate);

        await waitForExpect(async () => {
            // general statistics
            expect((await db.collection(statisticsCollectionName).doc('general').get()).data()!.affiliates).toBe(1);
            // birthdays statistics
            expect((await db.collection(statisticsCollectionName).doc('birthdays').get()).data()!['10']).toBe(0);
            // occupation relation statistics
            expect((await db.collection(occupationCollectionName).doc(occupation.id).get()).data()!.totalAffiliates).toBe(1);

            // todo test attachments when firebase storage emulator comes out
        }, 10_000);
    },
    integrationTestTimeout
);
