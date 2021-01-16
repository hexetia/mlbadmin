import puppeteer from 'puppeteer';
import { initBrowserWithAdmin, integrationTestTimeout } from '../../../testUtils/appTestUtils';
import { expectShowedAffiliatesNumber, storeNAffiliates } from '../../../testUtils/entitiesTestUtils';
import { currentMonth } from 'front/src/utils/dateUtils';
import { affiliatesCollectionName } from 'front/src/constants';
import { estados } from 'front/src/utils/estados';
import { muiSelectNative, waitAndClick, waitAndType } from '../../../testUtils/puppeteerExtends';
import { clearFirestoreSync, withFirestoreAdmin } from '../../../testUtils/firebaseTestUtils';
import { createFakeAffiliate } from '../../../testUtils/dumbData';

let browser: puppeteer.Browser | undefined;
let page: puppeteer.Page;
const testPageURL = 'http://localhost:3000/filiados';

beforeAll(async () => {
    const authenticatedBrowser = await initBrowserWithAdmin();
    browser = authenticatedBrowser.browser;
    page = authenticatedBrowser.page;
}, integrationTestTimeout);

beforeEach(async () => {
    await clearFirestoreSync();
    await page.goto(testPageURL);
}, integrationTestTimeout);

test(
    'show 10 affiliates default',
    async () => {
        await storeNAffiliates(12, { birthday: { day: 7, month: currentMonth().number, year: 2000 } });
        await page.goto(testPageURL);
        await expectShowedAffiliatesNumber(page, 10);
    },
    integrationTestTimeout * 4
);

test(
    'name filter',
    async () => {
        const first = createFakeAffiliate(undefined, { name: 'Fulano de tal' });
        const second = createFakeAffiliate(undefined, { name: 'Ciclano de tal' });

        await withFirestoreAdmin(async firestore => {
            await firestore.collection(affiliatesCollectionName).doc(first.id).set(first);
            await firestore.collection(affiliatesCollectionName).doc(second.id).set(second);
        });

        await page.reload();
        await expectShowedAffiliatesNumber(page, 2);

        await waitAndType(page, '[name="name_lowercase"]', first.name);

        await expectShowedAffiliatesNumber(page, 1);
    },
    integrationTestTimeout
);

test(
    'combine two filers',
    async () => {
        const sameAffiliateName = 'Fulano de tal';
        const first = createFakeAffiliate(undefined, { name: sameAffiliateName });
        const second = createFakeAffiliate(undefined, { name: sameAffiliateName });
        first.address.state = estados.PA;
        second.address.state = estados.BA;

        await withFirestoreAdmin(async firestore => {
            await firestore.collection(affiliatesCollectionName).doc(first.id).set(first);
            await firestore.collection(affiliatesCollectionName).doc(second.id).set(second);
        });

        await page.reload();
        await waitAndClick(page, '[data-test-id="moreFilters"]');
        await waitAndType(page, '[name="name_lowercase"]', first.name);

        await muiSelectNative(page, '[name="address.state"]', first.address.state);
        await expectShowedAffiliatesNumber(page, 1);
    },
    integrationTestTimeout
);

test(
    'load more items',
    async () => {
        await storeNAffiliates(15);

        await page.reload();
        await waitAndClick(page, '[data-test-id="loadMoreItems"]');
        await expectShowedAffiliatesNumber(page, 15);

        const isPresent = await page.evaluate(() => document.querySelector('[data-test-id="loadMoreItems"]') !== null);
        expect(isPresent).toBeFalsy();
    },
    integrationTestTimeout
);

afterAll(async () => await browser?.close());
