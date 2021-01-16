import type { FireFilter } from '../components/filters/FireFilter';
import { isFiltersEmpty } from './fireFiltersUtils';

const oinFilter: FireFilter<string> = {
    type: 'stringStartsWith',
    value: 'oin',
};

const emptyFilter: FireFilter<string> = {
    type: 'stringStartsWith',
    value: '   ',
};

test('', () => {
    expect(isFiltersEmpty(JSON.stringify([oinFilter]))).toBeFalsy();
    expect(isFiltersEmpty(JSON.stringify([emptyFilter]))).toBeTruthy();

    expect(isFiltersEmpty(JSON.stringify([oinFilter, emptyFilter]))).toBeFalsy();
});
