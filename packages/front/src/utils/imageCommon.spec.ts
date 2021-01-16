import { calculateAspectRatioFit } from './imageCommon';

describe('test all imageCommon.ts functions', () => {
    it('should resize and preserve aspect', () => {
        expect(calculateAspectRatioFit(1920, 1080, 1280, 800)).toEqual({ width: 1280, height: 720 });
        expect(calculateAspectRatioFit(1280, 960, 800, 960)).toEqual({ width: 800, height: 600 });
    });
});
