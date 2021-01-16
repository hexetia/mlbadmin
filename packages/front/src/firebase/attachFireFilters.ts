import type { FireFilter } from '../components/filters/FireFilter';
import { notEmptyStr } from '../utils/StringUtils';
import { normalizeText } from 'normalize-text';
import firebase from 'firebase/app';
import { lastDayOfMonth } from '../utils/dateUtils';

type Query = firebase.firestore.Query;

/**
 * Mutate query itself
 * @param query
 * @param filters
 */
export function attachFireFilters(query: Query, filters: string): Query {
    const filtersParsed: { [key: string]: FireFilter<string | Date> } = JSON.parse(filters);

    // firebase allow JUST one inequality where per query
    let inequalityFiltersUsed: number = 0;
    Object.entries(filtersParsed).forEach(([key, filter]) => {
        if (typeof filter.value === 'string' && !notEmptyStr(filter.value) && filter.type !== 'justOrder') {
            return;
        }

        if (filter.type === 'justOrder') {
            if (filter.order !== undefined) {
                query = query.orderBy(key, filter.order);
            }
        } else if (filter.type === 'equal') {
            query = query.where(key, '==', filter.value);
            if (filter.order !== undefined) {
                query = query.orderBy(key, filter.order);
            }
        } else if (filter.type === 'stringStartsWith') {
            inequalityFiltersUsed++;

            const filterValue = filter.value as string;
            const normalizedIfNeeded = key.includes('lowercase') ? normalizeText(filterValue.toLowerCase().trim()) : filterValue.trim();

            // For searching records starting with name queryText
            //
            // collectionRef.where('name', '>=', queryText).where('name', '<=', queryText+ '\uf8ff').
            //
            // The character \uf8ff used in the query is a very high code point in the Unicode range (it is a Private Usage Area [PUA] code).
            // Because it is after most regular characters in Unicode, the query matches all values that start with queryText.
            // see https://stackoverflow.com/a/56815787/4279104
            query = query.where(key, '>=', normalizedIfNeeded).orderBy(key);
            query = query.where(key, '<=', normalizedIfNeeded + '\uf8ff');
        } else if (filter.type === 'rangeEveryDaysOfMothByDate') {
            inequalityFiltersUsed++;

            // because filters was previous serialized in json
            const filterValue = new Date(filter.value);
            query = query
                .where(key, '>=', firebase.firestore.Timestamp.fromDate(new Date(filterValue.getFullYear(), filterValue.getMonth())))
                .orderBy(key)
                .where(
                    key,
                    '<',
                    firebase.firestore.Timestamp.fromDate(
                        new Date(filterValue.getFullYear(), filterValue.getMonth(), lastDayOfMonth(filterValue), 23, 59, 59, 99)
                    )
                );
        } else if (filter.type === 'rangeAllHoursOfDayByDate') {
            inequalityFiltersUsed++;

            // because filters was previous serialized in json
            const filterValue = new Date(filter.value) as Date;
            query = query
                .where(
                    key,
                    '>=',
                    firebase.firestore.Timestamp.fromDate(
                        new Date(filterValue.getFullYear(), filterValue.getMonth(), filterValue.getDate())
                    )
                )
                .orderBy(key)
                .where(
                    key,
                    '<',
                    firebase.firestore.Timestamp.fromDate(
                        new Date(filterValue.getFullYear(), filterValue.getMonth(), filterValue.getDate(), 23, 59, 59, 99)
                    )
                );
        }
    });

    if (inequalityFiltersUsed > 1) {
        throw new Error(
            'Check the filters code, firebase allow just ONE inequality filter per query, inequality filters used: ' + inequalityFiltersUsed
        );
    }

    return query;
}
