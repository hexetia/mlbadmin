import * as firebaseAdmin from 'firebase-admin';

firebaseAdmin.apps.length ? void 0 : firebaseAdmin.initializeApp();

export * from './occupationsFunctions';
export * from './affiliatesFunctions';
export * from './helpers/staticsCollectionUtils';
export * from './userFunctions';
export * from './attachmentsFunctions';
export * from './invitesFunctions';
