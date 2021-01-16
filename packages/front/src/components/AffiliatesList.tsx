import React, { useContext } from 'react';
import { affiliatesFiltersStoreContext } from '../stores/affiliatesFiltersStore';
import { useInfiniteQuery } from 'react-query';
import { getOccupationsOrAffiliates, IPagedFirestoreQuery } from '../firebase/getOccupationsOrAffiliates';
import { IAffiliate } from '../../../../types/__project_defs/IAffiliate';
import { affiliatesCollectionName } from '../constants';
import { AffiliatesListPages } from './AffiliatesListPages';
import { ShowMore } from './ShowMore';
import { isFiltersEmpty } from '../utils/fireFiltersUtils';
import { Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';

export const AffiliatesList = observer(() => {
    const filtersStore = useContext(affiliatesFiltersStoreContext);
    const isWithoutFilters = isFiltersEmpty(filtersStore.asString);

    const { data, fetchNextPage, hasNextPage, isLoading, status } = useInfiniteQuery<IPagedFirestoreQuery<IAffiliate>, Error>(
        [affiliatesCollectionName, filtersStore.asString, 10],
        getOccupationsOrAffiliates,
        {
            cacheTime: 1,
            keepPreviousData: true,
            refetchOnMount: true,
            refetchOnWindowFocus: false,
            getNextPageParam(lastPage) {
                if (lastPage.hasMore) {
                    return lastPage.querySnapshot;
                } else {
                    return false;
                }
            },
        }
    );

    if (status === 'error') {
        return <Typography color='error'>Erro ao carregar lista de filiados</Typography>;
    }

    if (status === 'success' && data?.pages && data.pages[0].items?.length === 0) {
        return (
            <Typography>
                {isWithoutFilters
                    ? 'Nenhum filiado cadastrado, crie o primeiro filiado usando o botão acima.'
                    : 'Nenhum filiado encontrado com os filtros usados.'}
            </Typography>
        );
    }

    return (
        <>
            <AffiliatesListPages pages={data} showOccupationName showCity />

            <ShowMore hasMore={hasNextPage} fetchNextPageFun={fetchNextPage} isFetchingMore={isLoading} />
        </>
    );
});
