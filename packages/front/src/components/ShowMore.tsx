import { ShowMoreButton } from './showMoreButton';
import React, { ReactNode } from 'react';

interface Props {
    hasMore: boolean;
    fetchNextPageFun: any;
    isFetchingMore: boolean;
    variant?: 'outlined';
    children?: ReactNode;
}

/**
 * Avoid repeating logic on every page that list items
 */
export const ShowMore = (props: Props) => {
    return (
        <>
            {props.hasMore && (
                // react-query needs fetchMore function to be called without params
                // by default react will put the event as param in onClick callback
                <ShowMoreButton
                    disabled={props.isFetchingMore}
                    variant='outlined'
                    onClick={() => props.fetchNextPageFun()}
                    data-test-id='loadMoreItems'
                >
                    {props.children || 'MOSTRAR MAIS'}
                </ShowMoreButton>
            )}
        </>
    );
};
