import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import 'firebase/functions';
import { firebaseConfigJs } from '../constants';
import { firebaseStorageMock } from './storageMock';

export const fireApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfigJs);

export const fireDB = fireApp.firestore();
fireDB.settings({
    ignoreUndefinedProperties: true,
});

function isLocalHost(): boolean {
    return (
        typeof window !== 'undefined' &&
        (location.hostname === 'localhost' ||
            location.hostname === '0.0.0.0' ||
            location.hostname === '127.0.0.1' ||
            location.hostname.startsWith('192.168'))
    );
}

export const fireStorage = isLocalHost() ? firebaseStorageMock : fireApp.storage();

if (isLocalHost()) {
    window.fireApp = fireApp;
    window.fireDB = fireDB;
    window.fireStorage = fireStorage;

    // @ts-ignore
    fireApp.auth().useEmulator(`http://${location.hostname}:9099/`, { disableWarnings: true });
    fireApp.functions().useEmulator(`${location.hostname}`, 5001);
    fireDB.settings({
        host: `${location.hostname}:8080`,
        ssl: false,
    });
}
