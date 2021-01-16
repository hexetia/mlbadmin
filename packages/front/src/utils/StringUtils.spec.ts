import { notEmptyStr } from './StringUtils';

describe('test all functions from StringUtils.ts', () => {
    it('test notEmptyStr function', () => {
        expect(notEmptyStr('')).toBe(false);
    });
});
