import { useContext } from 'react';
import styled from 'styled-components';
import { OccupationListItem } from './OccupationListItem';
import { IOccupation } from '../../../../types/__project_defs/IOccupation';
import { useInfiniteQuery } from 'react-query';
import { getOccupationsOrAffiliates, IPagedFirestoreQuery } from '../firebase/getOccupationsOrAffiliates';
import { occupationCollectionName } from '../constants';
import { occupationsFiltersStoreContext } from '../stores/occupationsFiltersStore';
import { observer } from 'mobx-react-lite';
import { Typography } from '@material-ui/core';
import { isFiltersEmpty } from '../utils/fireFiltersUtils';
import { ShowMore } from './ShowMore';

export const OccupationListItems = observer(() => {
    const occupationFiltersStore = useContext(occupationsFiltersStoreContext);
    const filtersStr = occupationFiltersStore.asString;
    const isWithoutFilters = isFiltersEmpty(filtersStr);

    const { data, fetchNextPage, hasNextPage, isFetching, isLoading, status } = useInfiniteQuery<IPagedFirestoreQuery<IOccupation>, Error>(
        [occupationCollectionName, filtersStr, 10],
        getOccupationsOrAffiliates,
        {
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

    const handleShowMore = () => fetchNextPage();

    if (status === 'error') {
        return <Typography>Erro ao carregar lista de ocupações</Typography>;
    }

    if (status === 'success' && data?.pages && data.pages[0].items?.length === 0) {
        return (
            <Typography>
                {isWithoutFilters
                    ? 'Nenhuma ocupação cadastrada ainda, crie a primeira ocupação usando o botão acima.'
                    : 'Nenhuma ocupação encontrada com os filtros usados.'}
            </Typography>
        );
    }

    return (
        <>
            <ListView>
                {data?.pages.map(page => page.items.map(occupation => <OccupationListItem key={occupation.id} occupation={occupation} />))}
            </ListView>

            <ShowMore hasMore={hasNextPage} isFetchingMore={isLoading} fetchNextPageFun={handleShowMore} />
        </>
    );
});

const ListView = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
`;
