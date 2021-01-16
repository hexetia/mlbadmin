import { basename } from './fileUtils';

describe('test file basename function', () => {
    it('should return correct extension from simple filenames', () => {
        expect(basename('oi.jpg')).toEqual('oi');
        expect(basename('m.docx')).toEqual('m');
        expect(basename('')).toEqual('');
    });

    it('test behavior of full file path', () => {
        expect(basename('/myDir/foo.jpg')).toEqual('foo');
        expect(basename('/myDir/')).toEqual('');
    });
});
