import React, { useState } from 'react';
import { OccupationListItems } from '../../components/OccupationListItems';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Add from '@material-ui/icons/Add';
import FilterListIcon from '@material-ui/icons/FilterList';
import { OccupationsFilters } from '../../components/filters/OccupationsFilters';
import styled from 'styled-components';
import Link from 'next/link';
import { ROLES } from '../../enums/ROLES';
import { GuardPage } from '../../security/GuardPage';
import Head from 'next/head';

function Occupations() {
    const [showFilters, setShowFilters] = useState(false);

    const toggleFilter = () => setShowFilters(state => !state);

    return (
        <>
            <Head>
                <title>Ocupações</title>
            </Head>
            <TitleAndFilterWrapper>
                <Typography variant='h2' gutterBottom>
                    Ocupações
                </Typography>

                <Link href='/ocupacoes/add' passHref>
                    <Button css='height: fit-content' startIcon={<Add />} variant='outlined' color='primary'>
                        Adicionar
                    </Button>
                </Link>
            </TitleAndFilterWrapper>

            <Button onClick={toggleFilter} startIcon={<FilterListIcon />} variant='outlined'>
                MAIS Filtros
            </Button>
            {showFilters && <OccupationsFilters />}

            <OccupationListItems />
        </>
    );
}

export default GuardPage(ROLES.CONTENT_EDITOR, Occupations);

const TitleAndFilterWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
`;
