import { useCallback, useEffect, useReducer } from 'react';
import { useMemoCompare } from './useMemoCompare';
import { Query, DocumentReference, QuerySnapshot, DocumentData } from '@firebase/firestore-types';
import { makeAutoObservable, observable, runInAction, toJS } from 'mobx';
import { useLocalObservable } from 'mobx-react-lite';
import useIsMountedRef from 'use-is-mounted-ref';

// copied from https://usehooks.com/useFirestoreQuery

// Reducer for hook state and actions
const reducer = (state: any, action: any) => {
    switch (action.type) {
        case 'idle':
            return { status: 'idle', data: undefined, error: undefined };
        case 'loading':
            return { status: 'loading', data: undefined, error: undefined };
        case 'success':
            return { status: 'success', data: action.payload, error: undefined };
        case 'error':
            return { status: 'error', data: undefined, error: action.payload };
        default:
            throw new Error('invalid action');
    }
};

// TODO create another hook that support paging
//   pages that the new hook can be used: /users, /invites, /
export function useFirestoreQuery(query: Query | DocumentReference) {
    // Our initial state
    // Start with an "idle" status if query is falsy, as that means hook consumer is
    // waiting on required data before creating the query object.
    // Example: useFirestoreQuery(uid && firestore.collection("profiles").doc(uid))
    const initialState = {
        status: query ? 'loading' : 'idle',
        data: undefined,
        error: undefined,
    };

    // Setup our state and actions
    const [state, dispatch] = useReducer(reducer, initialState);

    // Get cached Firestore query object with useMemoCompare (https://usehooks.com/useMemoCompare)
    // Needed because firestore.collection("profiles").doc(uid) will always being a new object reference
    // causing effect to run -> state change -> rerender -> effect runs -> etc ...
    // This is nicer than requiring hook consumer to always memoize query with useMemo.
    const queryCached = useMemoCompare(query, (prevQuery: any) => {
        // Use built-in Firestore isEqual method to determine if "equal"
        return prevQuery && query && query.isEqual(prevQuery);
    });

    useEffect(() => {
        // Return early if query is falsy and reset to "idle" status in case
        // we're coming from "success" or "error" status due to query change.
        if (!queryCached) {
            dispatch({ type: 'idle' });
            return;
        }

        dispatch({ type: 'loading' });

        // Subscribe to query with onSnapshot
        // Will unsubscribe on cleanup since this returns an unsubscribe function
        return queryCached.onSnapshot(
            (response: any) => {
                // Get data for collection or doc
                const data = response.docs ? getCollectionData(response) : getDocData(response);

                dispatch({ type: 'success', payload: data });
            },
            (error: any) => {
                console.error(error.message);
                dispatch({ type: 'error', payload: error });
            }
        );
    }, [queryCached]); // Only run effect if queryCached changes

    return state;
}

// Get doc data and merge doc.id
function getDocData(doc: any) {
    return doc.exists === true ? { id: doc.id, ...doc.data() } : null;
}

// Get array of doc data from collection
function getCollectionData(collection: any) {
    return collection.docs.map(getDocData);
}
