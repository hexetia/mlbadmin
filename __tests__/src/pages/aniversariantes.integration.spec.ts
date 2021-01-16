import puppeteer from 'puppeteer';
import { initBrowserWithAdmin, integrationTestTimeout } from '../../testUtils/appTestUtils';
import { currentMonth, monthsNamesWithNumber } from 'front/src/utils/dateUtils';
import { expectShowedAffiliatesNumber, storeNAffiliates } from '../../testUtils/entitiesTestUtils';
import { clearFirestoreSync } from '../../testUtils/firebaseTestUtils';
import { muiSelectNative } from '../../testUtils/puppeteerExtends';

let browser: puppeteer.Browser | undefined;
let page: puppeteer.Page;

beforeAll(async () => {
    const authenticatedBrowser = await initBrowserWithAdmin();
    browser = authenticatedBrowser.browser;
    page = authenticatedBrowser.page;
}, integrationTestTimeout);

beforeEach(async () => {
    await clearFirestoreSync();
}, integrationTestTimeout);

test(
    'Birthdays in current month should match',
    async () => {
        await storeNAffiliates(5, { birthday: { day: 7, month: currentMonth().number, year: 2000 } });
        await page.goto('http://localhost:3000/aniversariantes', { timeout: integrationTestTimeout / 2 });

        await expectShowedAffiliatesNumber(page, 5);

        await storeNAffiliates(2, { birthday: { day: 7, month: 2, year: 2000 } });
        await muiSelectNative(page, '#birthdayMonth', monthsNamesWithNumber['2'].name);

        await expectShowedAffiliatesNumber(page, 2);

        await muiSelectNative(page, '#birthdayMonth', currentMonth().name);
        await expectShowedAffiliatesNumber(page, 5);
    },
    integrationTestTimeout + 15_000
);

afterAll(async () => await browser?.close());
