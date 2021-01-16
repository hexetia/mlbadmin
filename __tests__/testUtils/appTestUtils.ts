import puppeteer from 'puppeteer';
import assert from 'assert';
import { APP_ADMIN_EMAILS } from 'functions/src/helpers/env';
import { waitAndType, waitForText } from './puppeteerExtends';

export const integrationTestTimeout = 30_000;

/**
 * Helper to abstract the code that usually is needed in beforeAll functions in tests
 */
export async function initBrowserWithAdmin(): Promise<{ browser?: puppeteer.Browser; page: puppeteer.Page }> {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        // devtools: true,
        defaultViewport: {
            width: 1280,
            height: 720,
        },
    });

    assert.ok(browser);

    const page = await browser.newPage();
    await page.goto('http://localhost:3000/');

    await waitAndType(page, '[data-testid="testLoginEmail"]', APP_ADMIN_EMAILS[0], { overrideCurrentValue: true });
    await page.waitForTimeout(1000);

    await Promise.all([
        waitForText(page, 'MAIORES OCUPAÇÕES', {
            timeout: integrationTestTimeout,
        }),
        await page.click('[data-testid="testLoginButton"]'),
    ]);

    return { browser, page };
}

export function arrayNItems(n: number): number[] {
    return new Array(n).fill(0);
}
