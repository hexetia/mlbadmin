import puppeteer from 'puppeteer';
import { initBrowserWithAdmin, integrationTestTimeout } from '../../testUtils/appTestUtils';
import waitForExpect from 'wait-for-expect';
import { currentMonth } from 'front/src/utils/dateUtils';
import { storeNAffiliates, storeNOccupations } from '../../testUtils/entitiesTestUtils';
import { waitForTestId } from '../../testUtils/puppeteerExtends';
import { clearFirestoreSync } from '../../testUtils/firebaseTestUtils';

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
    'Number of birthdays on a mount should be correct',
    async () => {
        const entitiesCreated = 5;
        await Promise.all([
            storeNAffiliates(entitiesCreated, { birthday: { day: 7, month: currentMonth().number, year: 2000 } }),
            storeNOccupations(entitiesCreated),
        ]);

        const actualNumberOfAffiliates = async () =>
            await page.evaluate(element => element.innerText, await waitForTestId(page, 'numberOfAffiliates'));

        await waitForExpect(async () => expect(await actualNumberOfAffiliates()).toBe(entitiesCreated.toString()), integrationTestTimeout);

        const numberOfBirthdays = async () =>
            await page.evaluate(element => element.innerText, await waitForTestId(page, 'numberOfBirthdays'));
        await waitForExpect(async () => expect(await numberOfBirthdays()).toBe(entitiesCreated.toString()), integrationTestTimeout);

        const numberOfOccupations = async () =>
            await page.evaluate(element => element.innerText, await waitForTestId(page, 'numberOfOccupations'));

        await waitForExpect(async () => expect(await numberOfOccupations()).toBe(entitiesCreated.toString()), integrationTestTimeout);
    },
    integrationTestTimeout * 4
);

afterAll(async () => await browser?.close());
