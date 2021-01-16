import firebase from 'firebase/app';

export const firebaseStorageMock = {
    ref: (ref: string = '') => {
        return new StorageClientEmulator(ref);
    },
};

class UploadTask {
    snapshot: any = {};

    cancel(): boolean {
        return false;
    }

    catch(onRejected: (error: firebase.storage.FirebaseStorageError) => any): Promise<any> {
        return Promise.resolve(false);
    }

    static on(
        event: firebase.storage.TaskEvent,
        nextOrObserver?:
            | firebase.storage.StorageObserver<firebase.storage.UploadTaskSnapshot>
            | ((snapshot: firebase.storage.UploadTaskSnapshot) => any)
            | null,
        error?: ((error: firebase.storage.FirebaseStorageError) => any) | null,
        complete?: firebase.Unsubscribe | null | any
    ): Function {
        complete();
        return {} as any;
        // return this.snapshot;
    }

    pause(): boolean {
        return true;
    }

    resume(): boolean {
        return true;
    }

    then(
        onFulfilled?: ((snapshot: firebase.storage.UploadTaskSnapshot) => any) | null,
        onRejected?: ((error: firebase.storage.FirebaseStorageError) => any) | null
    ): Promise<any> {
        return Promise.resolve(true);
    }
}

class StorageClientEmulator {
    private _child: string = '';

    constructor(private ref: string) {}

    child(child: string) {
        this._child = child;
        return this;
    }

    put(file: File | Blob): firebase.storage.UploadTask {
        return UploadTask as any;
    }

    getDownloadURL(): string {
        return 'https://mlbadmin.web.app/logo.png';
    }
}
