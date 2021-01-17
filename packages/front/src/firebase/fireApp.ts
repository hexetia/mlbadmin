declare var firebase: typeof import('firebase/app').default;
import { firebaseStorageMock } from './storageMock';

function isLocalHost(): boolean {
    return (
        typeof window !== 'undefined' &&
        (location.hostname === 'localhost' ||
            location.hostname === '0.0.0.0' ||
            location.hostname === '127.0.0.1' ||
            location.hostname.startsWith('192.168'))
    );
}

if (isLocalHost()) {
    window.fireApp = firebase.app();
    window.fireDB = window.fireApp.firestore();
    window.fireDB.settings({
        ignoreUndefinedProperties: true,
    });
    window.fireStorage = isLocalHost() ? firebaseStorageMock : window.fireApp.storage();

    // @ts-ignore
    window.fireApp.auth().useEmulator(`http://${location.hostname}:9099/`, { disableWarnings: true });
    window.fireApp.functions().useEmulator(`${location.hostname}`, 5001);
    window.fireDB.settings({
        host: `${location.hostname}:8080`,
        ssl: false,
    });
}
