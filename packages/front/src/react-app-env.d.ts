/// <reference types="react-scripts" />
/// <reference types="firebase/app" />

interface Window {
    firebase: ReturnType<typeof import('firebase')>;
    fireApp: firebase.app.App;
    fireDB: firebase.firestore.Firestore;
    fireStorage: firebase.storage.Storage;
}
