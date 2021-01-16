import { FireFilter } from '../components/filters/FireFilter';

export function isFiltersEmpty(filtersAsStr: string): boolean {
    const parsed: FireFilter<string>[] = JSON.parse(filtersAsStr);

    return !Object.values(parsed).some(filter => typeof filter.value === 'string' && filter.value.trim() !== '');
}
