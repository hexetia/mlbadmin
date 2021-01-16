/// <reference types="react-scripts" />
/// <reference types="firebase/app" />

interface Window {
    fireApp: firebase.app.App;
    fireDB: firebase.firestore.Firestore;
    fireStorage: firebase.storage.Storage;
}
