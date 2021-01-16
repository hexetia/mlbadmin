import puppeteer, { ElementHandle } from 'puppeteer';
import { getDocument, queries, waitFor } from 'pptr-testing-library';
import { attachmentsCollectionName } from 'front/src/constants';
import { initBrowserWithAdmin, integrationTestTimeout } from '../../testUtils/appTestUtils';
import path from 'path';
import assert from 'assert';
import * as fs from 'fs';
import { IAttachment } from '../../../types/__project_defs/IAttachment';
import waitForExpect from 'wait-for-expect';
import { clearFirestoreSync, fireTestApp } from '../../testUtils/firebaseTestUtils';
import { OccupationRepository } from 'front/src/repository/OccupationRepository';
import { waitAndClick, waitAndType, waitForText, waitForTextDisappear } from '../../testUtils/puppeteerExtends';
import { createFakeOccupation } from '../../testUtils/dumbData';

let browser: puppeteer.Browser | undefined;
let page: puppeteer.Page;
const occupationFormURL = 'http://localhost:3000/ocupacoes/add';

const occupationRepository = new OccupationRepository(fireTestApp.firestore());

beforeAll(async () => {
    const authenticatedBrowser = await initBrowserWithAdmin();
    browser = authenticatedBrowser.browser;
    page = authenticatedBrowser.page;
}, integrationTestTimeout);

beforeEach(async () => {
    await clearFirestoreSync();
}, integrationTestTimeout);

test(
    'contain all necessary fields',
    async () => {
        await page.goto(occupationFormURL);
        await page.setDefaultTimeout(5000);
        await page.waitForSelector(`input[name="name"]`);
        await page.waitForSelector(`[name="note"]`);
        await page.waitForSelector(`input[name="address.cep"]`);
        await page.waitForSelector(`[name="address.state"]`);
        await page.waitForSelector(`[name="address.city"]`);
        await page.waitForSelector(`input[name="address.neighborhood"]`);
        await page.waitForSelector(`input[name="address.street"]`);
        await page.waitForSelector(`input[name="address.number"]`);
        await page.waitForSelector(`input[name="address.complement"]`);
        await page.setDefaultTimeout(integrationTestTimeout);
    },
    integrationTestTimeout
);

test(
    'create occupation',
    async () => {
        await page.goto(occupationFormURL);

        const $doc = await getDocument(page);
        await waitFor(() => queries.getByTestId($doc, 'uploadPhoto'));

        const photoField = (await queries.getByTestId($doc, 'uploadPhoto')) as ElementHandle<HTMLInputElement>;
        const fullPathExampleFile = path.resolve(process.env.PWD + '/packages/front/public/apple-touch-icon.png');
        await photoField.uploadFile(fullPathExampleFile);
        await waitAndClick(page, '[data-testid="cropPhotoButton"]');

        await page.type('input[name="name"]', 'Nome Lindo');
        await page.type('textarea[name="note"]', 'Yhajshdjk');
        await page.type('input[name="address.cep"]', '03047-000');

        await page.waitForFunction(
            () => (document.querySelector('[name="address.neighborhood"]') as HTMLInputElement | null)?.value === 'Brás'
        );

        await waitAndClick(page, 'button[type="submit"]');

        await page.waitForFunction(() => !document.URL.includes('/add'));

        const createdOccupationID = page.url().split('/ocupacoes/')[1];
        const occupation = await occupationRepository.findById(createdOccupationID);

        expect(occupation.name).toBe('Nome Lindo');
    },
    integrationTestTimeout
);

test(
    'can provide an state and city in the autocomplete city field',
    async () => {
        await page.goto(occupationFormURL);
        await page.waitForSelector('select[name="address.state"]');
        await page.select('select[name="address.state"]', 'Pernambuco');
        await waitAndType(page, 'input[name="address.city"]', 'Ol');
        await waitForText(page, 'Olinda');
    },
    integrationTestTimeout
);

test(
    'update occupation',
    async () => {
        const occupation = await occupationRepository.save(createFakeOccupation({ name: 'Nome Lindo' }));
        await page.goto(`http://localhost:3000/ocupacoes/${occupation.id}`, { waitUntil: 'networkidle2' });

        await waitAndClick(page, `a[href="/ocupacoes/${occupation.id}/edit"]`);
        await page.waitForSelector(`input[name="address.cep"]`);

        await waitAndType(page, '[name="name"]', 'New Name', { overrideCurrentValue: true });

        await page.click('button[type="submit"]');

        const $doc = await getDocument(page);
        await waitFor(() => queries.getByTestId($doc, 'occupationPage'));

        const newOccupation = await occupationRepository.findById(occupation.id!);

        expect(newOccupation.name).toBe('New Name');
    },
    integrationTestTimeout
);

test(
    'delete occupation',
    async () => {
        const occupation = await occupationRepository.save(createFakeOccupation({ name: 'Nome Lindo' }));
        await page.goto(`http://localhost:3000/ocupacoes/${occupation.id}/edit`, { waitUntil: 'networkidle2' });
        await waitAndClick(page, '[data-testid="deleteOccupationButton"]');

        await page.waitForSelector('[data-testid="confirmInput"]');
        await page.type('[data-testid="confirmInput"]', occupation.name);
        await waitAndClick(page, '[data-testid="confirmButton"]');
        await page.waitForNavigation();

        await waitForExpect(async () => expect(occupationRepository.findById(occupation.id!)).rejects.toThrowError(), 10_000);
    },
    integrationTestTimeout
);

test(
    'attachments can be added, edited and removed in an occupation',
    async () => {
        const occupation = await occupationRepository.save(createFakeOccupation({ name: 'Nome Lindo' }));
        await page.goto(`http://localhost:3000/ocupacoes/${occupation.id}`, { waitUntil: 'networkidle2' });

        await waitAndClick(page, `.MuiAccordionSummary-root`);

        const attachmentsInputField = (await page.waitForSelector('input[type="file"]')) as ElementHandle<HTMLInputElement>;

        const fullPathExampleFile = path.resolve(process.env.PWD + '/packages/front/public/apple-touch-icon.png');
        assert(fs.existsSync(fullPathExampleFile));
        await attachmentsInputField.uploadFile(fullPathExampleFile);

        await waitForExpect(async () => {
            const attachmentDoc = fireTestApp.firestore().collection(attachmentsCollectionName).where('entityId', '==', occupation.id);

            return expect((await attachmentDoc.get()).empty).toBeFalsy();
        }, integrationTestTimeout / 2);

        const attachmentData = (
            await fireTestApp.firestore().collection(attachmentsCollectionName).where('entityId', '==', occupation.id).get()
        ).docs[0].data() as IAttachment;

        expect(
            await page.evaluate(
                async attachmentPath => await window.fireStorage.ref().child(attachmentPath).getDownloadURL(),
                attachmentData.path as string
            )
        ).toBeDefined();

        // removal of an attachment
        await waitAndClick(page, `[data-testid="deleteAttachment-${attachmentData.id}"]`);
        await waitAndClick(page, `button[data-testid="confirmButton"]`);
        await waitForTextDisappear(page, attachmentData.name);
    },
    integrationTestTimeout
);

afterAll(async () => {
    await browser?.close();
}, integrationTestTimeout);
