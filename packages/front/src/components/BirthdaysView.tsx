import { observer, useLocalObservable } from 'mobx-react-lite';
import { currentMonth, monthsNamesWithNumber } from '../utils/dateUtils';
import { runInAction, toJS } from 'mobx';
import { useInfiniteQuery, useQuery } from 'react-query';
import { getOccupationsOrAffiliates, IPagedFirestoreQuery } from '../firebase/getOccupationsOrAffiliates';
import { IAffiliate } from '../../../../types/__project_defs/IAffiliate';
import { affiliatesCollectionName } from '../constants';
import React from 'react';
import { FormControl, InputLabel, NativeSelect, Typography } from '@material-ui/core';
import { estados } from '../utils/estados';
import { ReactFitty } from './ReactFitty';
import { AffiliatesListPages } from './AffiliatesListPages';
import { ShowMore } from './ShowMore';
import { OccupationRepository } from '../repository/OccupationRepository';
import { useClientRouter } from 'use-client-router';

function parseFilters<T>(filtersStore: T): Partial<T> {
    const filters = toJS(filtersStore);
    const newObj = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value.type !== 'justOrder' && value !== '') {
            newObj[key] = value;
        }
    });

    return newObj;
}

export const BirthdaysView = observer(() => {
    const clientRouter = useClientRouter();
    const occupationId = clientRouter.query.id;

    const { data: occupation } = useQuery(
        'birthdays_occupation',
        () => new OccupationRepository(window.fireDB).findById(clientRouter.query.id as string),
        { enabled: occupationId !== undefined }
    );

    const store = useLocalObservable(() => ({
        'birthday.day': {
            type: 'justOrder',
            value: '',
            order: 'asc',
        },
        occupationId: {
            type: 'equal',
            value: clientRouter.query.id || '',
        },
        'birthday.month': {
            type: 'equal',
            value: currentMonth().number,
        },
        'address.state': {
            type: 'equal',
            value: '',
        },
    }));

    const filters = parseFilters(store);

    const { data, fetchNextPage, hasNextPage, isLoading, error, status } = useInfiniteQuery<IPagedFirestoreQuery<IAffiliate>, Error>(
        [affiliatesCollectionName, JSON.stringify(filters), 10],
        getOccupationsOrAffiliates,
        {
            keepPreviousData: false,
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

    const handleChange = (property: keyof typeof store) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (property === 'birthday.month') {
            // needed to be int for filters works
            runInAction(() => (store[property].value = parseInt(e.target.value)));
        } else {
            runInAction(() => (store[property].value = e.target.value));
        }
    };

    return (
        <>
            <div css='display: flex'>
                <div css='padding: 16px'>
                    <FormControl>
                        <InputLabel htmlFor='birthday.month'>Mês</InputLabel>
                        <NativeSelect
                            variant='outlined'
                            id='birthdayMonth'
                            value={filters['birthday.month'].value}
                            onChange={handleChange('birthday.month')}
                        >
                            {Object.values(monthsNamesWithNumber).map(month => (
                                <option value={month.number} key={month.name}>
                                    {month.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </FormControl>
                </div>

                {!occupationId && (
                    <div css='padding: 16px'>
                        <FormControl>
                            <InputLabel htmlFor='address.state'>Estado</InputLabel>
                            <NativeSelect
                                variant='outlined'
                                id='addressState'
                                value={store['address.state'].value}
                                onChange={handleChange('address.state')}
                            >
                                <option value='' />
                                {Object.values(estados).map(state => (
                                    <option value={state} key={state}>
                                        {state}
                                    </option>
                                ))}
                            </NativeSelect>
                        </FormControl>
                    </div>
                )}
            </div>

            <Typography variant='h2' component={ReactFitty} className='nice'>
                Aniversariantes de {currentMonth(store['birthday.month'].value).name}
            </Typography>

            {occupationId && <Typography variant='subtitle2'>Ocupação {occupation?.name}</Typography>}

            {status === 'success' && data?.pages && data.pages[0].items?.length === 0 && (
                <Typography variant='subtitle1'>
                    Nenhum aniversariante no mês de {currentMonth(store['birthday.month'].value).name}.
                </Typography>
            )}

            <AffiliatesListPages pages={data} showBirthday showOccupationName />

            {status === 'error' && (
                <Typography variant='caption'>Erro ao buscar aniversariantes. código do erro: {error.message}</Typography>
            )}

            <ShowMore fetchNextPageFun={fetchNextPage} isFetchingMore={isLoading} hasMore={hasNextPage} />
        </>
    );
});
