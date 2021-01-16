import firebase from 'firebase/app';

type QuerySnapshot = firebase.firestore.QuerySnapshot;
type Query = firebase.firestore.Query;

export const firestoreHasMore = async (alreadyConstructedQuery: Query, queryResult: QuerySnapshot): Promise<boolean> => {
    if (queryResult.size > 0) {
        const hasMoreQuery = await alreadyConstructedQuery
            .startAfter(queryResult.docs[queryResult.docs.length - 1])
            .limit(1)
            .get();

        return hasMoreQuery.size > 0;
    }

    return false;
};
