import puppeteer from 'puppeteer';
import { initBrowserWithAdmin, integrationTestTimeout } from '../../testUtils/appTestUtils';
import { waitAndType } from '../../testUtils/puppeteerExtends';

let browser: puppeteer.Browser | undefined;
let page: puppeteer.Page;
const testPageURL = 'http://localhost:3000/';
const appBarInputSelector = '[name="AffiliateNameSearchAppbar"]';
const affiliatesPageSearchByNameSelector = '[name="name_lowercase"]';

beforeAll(async () => {
    const authenticatedBrowser = await initBrowserWithAdmin();
    browser = authenticatedBrowser.browser;
    page = authenticatedBrowser.page;
}, integrationTestTimeout);

test(
    'redirect to affiliates page when user type on input on desktop and provide to real search input the text that user typed',
    async () => {
        await page.goto(testPageURL);
        const textTyped = 'randomText';

        await Promise.all([waitAndType(page, appBarInputSelector, textTyped), page.waitForNavigation()]);
        await page.waitForFunction(
            (selector, text) => document.querySelector(selector)?.value === text,
            {},
            affiliatesPageSearchByNameSelector,
            textTyped
        );

        // input on appbar should cleared after redirect
        await page.waitForFunction(selector => document.querySelector(selector)?.value === '', {}, appBarInputSelector);
    },
    integrationTestTimeout
);

afterAll(async () => await browser?.close());
