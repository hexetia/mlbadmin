import { acceptMoreFiles } from './acceptMoreFiles';

describe('acceptMoreFiles test suite', () => {
    it('accept more files until reach the limit', () => {
        expect(acceptMoreFiles(50, 10, 60)).toBeTruthy();
        expect(acceptMoreFiles(50, 1, 50)).toBeFalsy();
        expect(acceptMoreFiles(50, 0, 50)).toBeFalsy();
    });
});
