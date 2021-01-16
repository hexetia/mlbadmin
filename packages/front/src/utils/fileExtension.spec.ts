import { fileExtension } from './fileExtension';

describe('test file extension extractor', () => {
    it('should return correct extension', () => {
        expect(fileExtension('oi.jpg')).toEqual('jpg');
        expect(fileExtension('m.docx')).toEqual('docx');
    });

    it('should be resilient', () => {
        expect(fileExtension('fileNameWithoutExtension')).toEqual('');

        expect(fileExtension('')).toEqual('');
    });
});
