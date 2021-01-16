import React, { useContext, useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import { fireDB } from '../firebase/fireApp';
import styled from 'styled-components';
import TextField from '@material-ui/core/TextField';
import { IOccupation } from '../../../../types/__project_defs/IOccupation';
import numd from 'numd';
import Divider from '@material-ui/core/Divider';
import { Hidden } from '@material-ui/core';
import { useFirestoreQuery } from '../customHooks/useFirestoreQuery';
import { changeSearchAppBarStore } from '../common/changeSearchAppBarStore';
import { occupationCollectionName, statisticsCollectionName } from '../constants';
import { currentMonth } from '../utils/dateUtils';
import { GuardPage } from '../security/GuardPage';
import { ROLES } from '../enums/ROLES';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';
import { affiliatesFiltersStoreContext } from '../stores/affiliatesFiltersStore';
import Head from 'next/head';
import theme from 'theme.macro';
import { ReactFitty } from '../components/ReactFitty';

const Dashboard = () => {
    const cuMonth = currentMonth();
    const filtersStore = useContext(affiliatesFiltersStoreContext);
    const nameRef = useRef<HTMLInputElement | null>(null);

    /**
     * Redirect to affiliate page when necessary
     * and force focus on use of the page filter instead of the search appbar filter
     */
    const [handleChangeSearch] = useDebouncedCallback(
        (value: string) => changeSearchAppBarStore(nameRef.current!, filtersStore, value),
        500
    );

    const { data: statisticsData } = useFirestoreQuery(fireDB.collection('statistics').doc('general'));

    const { data: biggestOccupations } = useFirestoreQuery(
        fireDB
            .collection(occupationCollectionName)
            .where('totalAffiliates' as keyof IOccupation, '>', 0)
            .limit(5)
            .orderBy('totalAffiliates' as keyof IOccupation, 'desc')
    );
    const { data: numberOfBirthdaysByMonth } = useFirestoreQuery(fireDB.collection(statisticsCollectionName).doc('birthdays'));

    return (
        <>
            <Head>
                <title>Início</title>
            </Head>
            <StyledContainer>
                <div>
                    <Hidden mdUp>
                        <div css='padding: 16px'>
                            <MobileSearchTextField
                                inputRef={nameRef}
                                size='small'
                                variant='filled'
                                label='Buscar filiado...'
                                onChange={e => handleChangeSearch(e.target.value)}
                            />
                        </div>
                    </Hidden>

                    <div css='display: flex;'>
                        <NumberBlock>
                            <Link href='/filiados'>
                                <a>
                                    <Typography variant='caption'>FILIADOS</Typography>
                                    <NumberValue data-testid='numberOfAffiliates'>{statisticsData?.affiliates || 0}</NumberValue>
                                </a>
                            </Link>
                        </NumberBlock>

                        <NumberBlock>
                            <Link href='/ocupacoes'>
                                <a>
                                    <Typography variant='caption'>OCUPAÇÕES</Typography>
                                    <NumberValue data-testid='numberOfOccupations'>{statisticsData?.occupations || 0}</NumberValue>
                                </a>
                            </Link>
                        </NumberBlock>

                        <NumberBlock>
                            <Link href='/aniversariantes'>
                                <a>
                                    <Typography variant='caption' data-testid='currentMonthNameAbbrev' component={ReactFitty}>
                                        ANIVERSÁRIOS {cuMonth.nameAbbrev.toUpperCase()}
                                    </Typography>
                                    <NumberValue data-testid='numberOfBirthdays'>
                                        {numberOfBirthdaysByMonth?.[cuMonth.number] || 0}
                                    </NumberValue>
                                </a>
                            </Link>
                        </NumberBlock>
                    </div>
                </div>

                <section css='padding-left: 16px;margin-top: 8px'>
                    <Typography variant='h5' gutterBottom>
                        MAIORES OCUPAÇÕES
                    </Typography>

                    {biggestOccupations &&
                        biggestOccupations!.map((occupation: IOccupation) => (
                            <div css='padding: 8px 0' key={occupation.id}>
                                <Link href={`/ocupacoes/${occupation.id}`} passHref>
                                    <a css={'text-decoration: none'}>
                                        <Typography variant='subtitle2'>
                                            {occupation.name}
                                            <Typography variant='caption' display='block'>
                                                {numd(occupation.totalAffiliates || 0, 'filiado', 'filiados')}
                                            </Typography>
                                        </Typography>
                                    </a>
                                </Link>
                                <Divider />
                            </div>
                        ))}
                </section>
            </StyledContainer>
        </>
    );
};

const StyledContainer = styled.div`
    padding-left: 0;
    padding-right: 0;

    ${theme.breakpoints.up('md')} {
        padding-left: ${theme.spacing(2)}px;
        padding-right: ${theme.spacing(2)}px;
        max-width: 1280px;
        margin-left: auto;
        margin-right: auto;
    }
`;

const NumberBlock = styled.div`
    display: block;
    padding: ${theme.spacing(2)}px;
    & a {
        text-decoration: none;
    }
`;

const NumberValue = styled(({ ...rest }) => <Typography variant='h5' {...rest} />)`
    vertical-align: middle;
    padding: 0 ${theme.spacing(0.5)}px;
`;

const MobileSearchTextField = styled(TextField)`
    width: 100%;
    background-color: ${theme.isDark ? 'transparent' : 'white'};
    border-radius: 4px;
`;

export default GuardPage(ROLES.CONTENT_EDITOR, Dashboard);
