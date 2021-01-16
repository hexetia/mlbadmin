/**
 * @jest-environment node
 */
import puppeteer from 'puppeteer';
import { APP_ADMIN_EMAILS } from 'functions/src/helpers/env';
import { waitAndType, waitForText } from '../../testUtils/puppeteerExtends';
import { integrationTestTimeout } from '../../testUtils/appTestUtils';

test(
    'login with the two admin emails, then login with a unknown email',
    async () => {
        await login(APP_ADMIN_EMAILS[0]);
        await login(APP_ADMIN_EMAILS[1]);
        await login('nonadminemail@gmail.com', true);
    },
    integrationTestTimeout
);

/**
 * When user login an account is automatically created by firebase
 */
async function login(email: string, expectAccountToBeDeleted?: boolean) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
        devtools: false,
        defaultViewport: {
            width: 1280,
            height: 720,
        },
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:3000/');

    await waitAndType(page, '[data-testid="testLoginEmail"]', email, { overrideCurrentValue: true });
    await page.waitForTimeout(1000);

    await Promise.all([
        waitForText(page, expectAccountToBeDeleted ? 'Infelizmente você não possui um convite de acesso' : 'MAIORES OCUPAÇÕES', {
            timeout: integrationTestTimeout,
        }),
        await page.click('[data-testid="testLoginButton"]'),
    ]);

    await browser.close();
}
