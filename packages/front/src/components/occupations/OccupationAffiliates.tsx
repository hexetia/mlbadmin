import React, { useContext } from 'react';
import { useInfiniteQuery } from 'react-query';
import { getOccupationsOrAffiliates, IPagedFirestoreQuery } from '../../firebase/getOccupationsOrAffiliates';
import { IAffiliate } from '../../../../../types/__project_defs/IAffiliate';
import { affiliatesCollectionName } from '../../constants';
import { FireFilter } from '../filters/FireFilter';
import { affiliatesFiltersStoreContext } from '../../stores/affiliatesFiltersStore';
import { AffiliatesListPages } from '../AffiliatesListPages';
import { Typography } from '@material-ui/core';
import { isFiltersEmpty } from '../../utils/fireFiltersUtils';
import { ShowMore } from '../ShowMore';
import { observer } from 'mobx-react-lite';

export const OccupationAffiliates = observer((props: { occupationId: string }) => {
    const filtersStore = useContext(affiliatesFiltersStoreContext);
    const filtersStr = filtersStore.asString;
    const isWithoutFilters = isFiltersEmpty(filtersStr);

    const { data, fetchNextPage, hasNextPage, isLoading, status, error } = useInfiniteQuery<IPagedFirestoreQuery<IAffiliate>, Error>(
        [
            affiliatesCollectionName,
            JSON.stringify({
                ...JSON.parse(filtersStr),
                occupationId: {
                    type: 'equal',
                    value: props.occupationId,
                } as FireFilter<string>,
            }),
            10,
        ],
        getOccupationsOrAffiliates,
        {
            keepPreviousData: true,
            refetchOnMount: true,
            refetchOnWindowFocus: false,
            retry: 5,
            retryDelay: 1000,
            getNextPageParam(lastPage) {
                if (lastPage.hasMore) {
                    return lastPage.querySnapshot;
                } else {
                    return false;
                }
            },
        }
    );

    if (status === 'success' && data?.pages && data.pages[0].items?.length === 0) {
        return (
            <Typography variant='subtitle1'>
                {isWithoutFilters
                    ? 'Ainda não tem nenhum filiado vinculado a essa ocuapção.'
                    : 'Nenhum filiado encontrado usando essas filtros.'}
            </Typography>
        );
    }

    if (status === 'error') {
        return <div>Erro ao carregar lista de filiados. código do erro: {error.message}</div>;
    }

    return (
        <>
            <AffiliatesListPages pages={data} />

            <ShowMore hasMore={hasNextPage} fetchNextPageFun={fetchNextPage} isFetchingMore={isLoading} />
        </>
    );
});
