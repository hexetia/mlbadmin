import { fileExtension } from '../utils/fileExtension';
import { fireStorage } from '../firebase/fireApp';

export async function storeImageIfNecessary(entity: any, propertyName: string, filePathWithoutExtension: string) {
    if (entity[propertyName].blob instanceof Blob) {
        filePathWithoutExtension = filePathWithoutExtension + fileExtension(entity[propertyName].blob.name);
        const imageRef = fireStorage.ref().child(filePathWithoutExtension);
        await imageRef.put(entity[propertyName].blob);
        entity[propertyName] = filePathWithoutExtension;
    } else {
        // console.log('não é um blob', entity[propertyName]);
    }
}
