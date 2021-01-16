import { isFullName } from './isFullName';

describe('some full name test cases', () => {
    it('should not accept without whitspaces', () => {
        expect(isFullName('DeveFalhar')).toBe(false);
        expect(isFullName('Deve Passar')).toBe(true);
    });

    it('should both name and lastname have atleast two characters', () => {
        expect(isFullName('Deve F')).toBe(false);
        expect(isFullName('D Falhar')).toBe(false);
        expect(isFullName('Deve P.')).toBe(true);
        expect(isFullName('Deve P Passar')).toBe(true);
        expect(isFullName('Deve P O I Passar')).toBe(true);
    });

    it('should not fail on fuzzy', () => {
        expect(isFullName(null as any)).toBe(false);
        expect(isFullName(undefined as any)).toBe(false);
        expect(isFullName({} as any)).toBe(false);

        class Maria {}
        expect(isFullName(new Maria() as any)).toBe(false);
    });
});
