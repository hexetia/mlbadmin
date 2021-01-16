import isInJSDOM from 'is-in-browser';
import * as firebase from '@firebase/rules-unit-testing';

require('dotenv').config({ path: __dirname + '/../.env.local' });

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_EMULATOR_HUB = 'localhost:4400';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

if (!isInJSDOM) {
    require('expect-puppeteer');
    // Global patch (to support external modules like is-blob).
    globalThis.Blob = require('cross-blob');
} else {
    // add custom jest matchers for asserting on DOM nodes.
    // allows you to do things like:
    // expect(element).toHaveTextContent(/react/i)
    // learn more: https://github.com/testing-library/jest-dom
    require('@testing-library/jest-dom/extend-expect');
    // @ts-ignore
    window.URL.createObjectURL = () => 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
}

afterAll(async () => {
    // jest don't exit after tests without this
    // @see https://github.com/facebook/jest/issues/1456#issuecomment-587529051
    for (const app of firebase.apps()) {
        await app.delete();
    }
});
