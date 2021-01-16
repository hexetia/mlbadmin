import puppeteer, { ElementHandle } from 'puppeteer';
import * as path from 'path';
import { IAffiliate } from '../../../../types/__project_defs/IAffiliate';
import { generateCPF } from '@brazilian-utils/brazilian-utils';
import { initBrowserWithAdmin, integrationTestTimeout } from '../../../testUtils/appTestUtils';
import { AffiliateRepository } from 'front/src/repository/AffiliateRepository';
import { waitAndClick, waitAndType, waitForText } from '../../../testUtils/puppeteerExtends';
import { OccupationRepository } from 'front/src/repository/OccupationRepository';
import waitForExpect from 'wait-for-expect';
import { clearFirestoreSync, fireTestApp } from '../../../testUtils/firebaseTestUtils';
import { createFakeAffiliate, createFakeOccupation } from '../../../testUtils/dumbData';

let browser: puppeteer.Browser | undefined;
let page: puppeteer.Page;
const formURL = 'http://localhost:3000/filiados/add';

const affiliateRepository = new AffiliateRepository(fireTestApp.firestore());

beforeAll(async () => {
    const authenticatedBrowser = await initBrowserWithAdmin();
    browser = authenticatedBrowser.browser;
    page = authenticatedBrowser.page;
}, integrationTestTimeout);

beforeEach(async () => {
    await clearFirestoreSync();
}, integrationTestTimeout);

async function fillAffiliateForm(page: puppeteer.Page, partialAffiliate: Partial<IAffiliate>) {
    await page.waitForSelector('h4[data-testid="formTitle"]');

    const photoField = (await page.$('[data-testid="uploadPhoto"]')) as ElementHandle<HTMLInputElement>;

    const fullPathExampleFile = path.resolve(process.env.PWD + '/packages/front/public/apple-touch-icon.png');
    await photoField.uploadFile(fullPathExampleFile);

    await waitAndClick(page, '[data-testid="cropPhotoButton"]');

    await page.type('input[name="name"]', partialAffiliate.name || 'Nome do Fulano de Tal');
    await page.type('input[name="phoneNumber"]', partialAffiliate.phoneNumber || '61993316821');
    await page.type('input[name="birthday"]', (partialAffiliate.birthday as string) || '08/04/2000');
    await page.select('select[name="educationLevel"]', partialAffiliate.educationLevel || 'Graduação');
    await page.select('select[name="genre"]', partialAffiliate.genre || 'Masculino');
    await page.select('select[name="maritalStatus"]', partialAffiliate.maritalStatus || 'Casada(o)');
    await page.type('input[name="cpf"]', partialAffiliate.cpf || generateCPF());
    await page.type('input[name="rg"]', partialAffiliate.rg || '1231255');
    await page.type('input[name="nis"]', partialAffiliate.nis || '123456');
    await page.type('textarea[name="note"]', partialAffiliate.note || 'Yhajshdjk');

    await page.click('button[type="submit"]');

    await page.waitForSelector('div[data-testid="affiliatePage"]');
}

test(
    'contain all necessary fields',
    async () => {
        await page.goto(formURL);
        await page.waitForSelector(`[name="name"]`);
        await page.waitForSelector(`[name="phoneNumber"]`);
        await page.waitForSelector(`[name="birthday"]`);
        await page.waitForSelector(`[name="educationLevel"]`);
        await page.waitForSelector(`[name="genre"]`);
        await page.waitForSelector(`[name="maritalStatus"]`);
        await page.waitForSelector(`[name="cpf"]`);
        await page.waitForSelector(`[name="rg"]`);
        await page.waitForSelector(`[name="nis"]`);
        await page.waitForSelector(`[name="note"]`);
        await page.waitForSelector(`[name="address.number"]`);
        await page.waitForSelector(`[name="address.complement"]`);
    },
    integrationTestTimeout
);

test(
    'create affiliate',
    async () => {
        await page.goto(formURL);

        await fillAffiliateForm(page, { name: 'Nome do Fulano de Tal', birthday: '08/04/2000' });
        const createdAffiliateID = page.url().split('/filiados/')[1];

        const affiliate = await affiliateRepository.findById(createdAffiliateID);

        expect(affiliate.name).toBe('Nome do Fulano de Tal');
        expect(affiliate.birthday).toEqual({ day: 8, month: 4, year: 2000 });
    },
    integrationTestTimeout
);

test(
    'can provide an occupation in the autocomplete occupation field',
    async () => {
        const occupationName = 'RandomOccupationName';
        const occupationRepository = new OccupationRepository(fireTestApp.firestore());
        await occupationRepository.save(createFakeOccupation({ name: occupationName }));

        await page.goto(formURL);
        await waitAndType(page, 'input[name="occupation"]', 'Random');
        await waitForText(page, occupationName);
    },
    integrationTestTimeout
);

test(
    'show all fields by default, but can reuse occupation fields',
    async () => {
        await page.goto(formURL);
        await page.waitForSelector('[name="address.cep"]');
        await page.waitForSelector('[name="address.street"]');
        await page.waitForSelector('[name="address.city"]');

        await page.waitForSelector('[name="address.number"]');
        await page.waitForSelector('[name="address.complement"]');

        await waitAndClick(page, '[name="useOccupationAddress"]');

        try {
            await page.waitForSelector('[name="address.cep"]', { timeout: 100 });
        } catch (ignore) {}
    },
    integrationTestTimeout
);

test(
    'update affiliate',
    async () => {
        const newTitle = 'Gimme My Money';
        const { id: createdAffiliateID } = await affiliateRepository.save(
            createFakeAffiliate(undefined, {
                birthday: {
                    day: 8,
                    month: 3,
                    year: 2000,
                },
            })
        );

        await page.goto(`http://localhost:3000/filiados/${createdAffiliateID}`);
        await waitAndClick(page, `a[href="/filiados/${createdAffiliateID}/edit"]`);

        await waitAndType(page, '[name="name"]', newTitle, { overrideCurrentValue: true });

        await Promise.all([page.click('button[type="submit"]'), page.waitForNavigation()]);

        const affiliate = await affiliateRepository.findById(createdAffiliateID!);
        expect(affiliate.name).toBe(newTitle);
        expect(affiliate.birthday).toEqual({ day: 8, month: 3, year: 2000 });
    },
    integrationTestTimeout + integrationTestTimeout
);

test(
    'delete affiliate',
    async () => {
        const { id: createdAffiliateID, name } = await affiliateRepository.save(createFakeAffiliate());
        await page.goto(`http://localhost:3000/filiados/${createdAffiliateID}/edit`);

        await waitAndClick(page, '[data-testid="deleteAffiliateButton"]');

        await page.waitForSelector('[data-testid="confirmInput"]');
        await page.type('[data-testid="confirmInput"]', name);
        await waitAndClick(page, '[data-testid="confirmButton"]');
        await page.waitForNavigation();

        await waitForExpect(async () => {
            expect(await affiliateRepository.findById(createdAffiliateID!)).toBe(undefined);
        }, 10_000);
    },
    integrationTestTimeout
);

afterAll(async () => await browser?.close());
