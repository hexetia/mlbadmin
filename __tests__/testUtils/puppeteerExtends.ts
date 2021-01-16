import puppeteer from 'puppeteer';
import { integrationTestTimeout } from './appTestUtils';

// todo publish as a npm package

/**
 * Wait for element then type in a human way
 *
 * Puppeteer type API are too low-level for integration tests, that helper abstract a common routine
 * typing text in input need in a very close way that common user do
 *
 * @param page
 * @param selector
 * @param value
 * @param options
 */
export async function waitAndType(page: puppeteer.Page, selector: string, value: string, options?: { overrideCurrentValue?: boolean }) {
    const element = await page.waitForSelector(selector, { timeout: integrationTestTimeout });

    if (options?.overrideCurrentValue) {
        await element.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
    }

    await page.type(selector, value);
}

/**
 * Wait until the text appear on page
 */
export async function waitForText(page: puppeteer.Page, text: string, options: puppeteer.PageFnOptions = {}) {
    await page.waitForFunction(text => window.document.body.innerHTML.includes(text), options, text);
}

/**
 * Wait until the disappear from page
 */
export async function waitForTextDisappear(page: puppeteer.Page, text: string) {
    await page.waitForFunction(text => !window.document.body.innerHTML.includes(text), {}, text);
}

/**
 * Wait for element be present in page then click
 *
 * @param page
 * @param selector
 */
export async function waitAndClick(page: puppeteer.Page, selector: string) {
    await page.waitForSelector(selector);
    await page.evaluate(selector => document.querySelector(selector).click(), selector);
}

export async function waitForTestId(page: puppeteer.Page, testId: string): Promise<puppeteer.ElementHandle<Element>> {
    return await page.waitForSelector(`[data-testid="${testId}"]`);
}

export async function gotoPageIfItIsNotAlreadyInIt(page: puppeteer.Page, targetPageURL: string) {
    if (page.url() !== targetPageURL) {
        await page.goto(targetPageURL);
    }
}

async function getInnerText(page: puppeteer.Page, element: puppeteer.ElementHandle): Promise<string> {
    return (await page.evaluate(element => element.innerText, element)) as string;
}

export async function muiSelectNative(page: puppeteer.Page, selectSelector: string, optionLabel: string): Promise<void> {
    await page.waitForSelector(selectSelector);
    await page.click(selectSelector);

    const targetChildNumber = (await page.evaluate(
        async (selectId, optionLabel) => {
            const options = document.querySelectorAll(`${selectId} option`) as NodeListOf<HTMLOptionElement>;
            let i = 0;
            for (let op of options) {
                if (op.innerText === optionLabel) {
                    op.click();
                    return i;
                }
                i++;
            }
        },
        selectSelector,
        optionLabel
    )) as number;

    const optionsLength = (await page.$$(`${selectSelector} option`)).length;
    for (let i = 0; i < optionsLength; i++) {
        await page.keyboard.press('ArrowUp');
    }

    for (let i = 0; i < targetChildNumber; i++) {
        await page.keyboard.press('ArrowDown');
    }

    await page.keyboard.press('Enter');
}
