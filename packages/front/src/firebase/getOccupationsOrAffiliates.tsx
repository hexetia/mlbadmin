import { attachFireFilters } from './attachFireFilters';
import { firestoreHasMore } from './firestoreHasMore';
import { QueryFunctionContext } from 'react-query/types/core/types';
import type firebase from 'firebase/app';

type QuerySnapshot = firebase.firestore.QuerySnapshot;
type Query = firebase.firestore.Query;

export interface IPagedFirestoreQuery<T> {
    items: T[];
    querySnapshot: QuerySnapshot;
    filtersUsed: string;
    hasMore: boolean;
}

export async function getOccupationsOrAffiliates<T>(context: QueryFunctionContext<any>): Promise<IPagedFirestoreQuery<T>> {
    const [_, filters, itemsPerPage] = context.queryKey;
    const querySnapshot: undefined | QuerySnapshot | boolean = context.pageParam;

    let query: Query = window.fireDB.collection(context.queryKey[0] as string);
    query = attachFireFilters(query, filters);
    query = query.orderBy('name', 'asc');

    if (typeof querySnapshot !== 'boolean' && querySnapshot !== undefined) {
        query = query.startAfter(querySnapshot!.docs[querySnapshot!.docs.length - 1]);
    }

    const queryResult = await query.limit(itemsPerPage).get();
    const hasMore = await firestoreHasMore(query, queryResult);

    return {
        items: queryResult.docs.map(doc => doc.data() as T),
        querySnapshot: queryResult,
        filtersUsed: filters,
        hasMore,
    };
}
