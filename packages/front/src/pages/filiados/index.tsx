import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FilterListIcon from '@material-ui/icons/FilterList';
import Add from '@material-ui/icons/Add';
import styled from 'styled-components';
import { AffiliateFilters, clearOthersInequalityUncontrolledInputs } from '../../components/filters/AffiliatesFilters';
import TextField from '@material-ui/core/TextField';
import { affiliatesFiltersStoreContext } from '../../stores/affiliatesFiltersStore';
import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { GuardPage } from '../../security/GuardPage';
import { ROLES } from '../../enums/ROLES';
import { AffiliatesList } from '../../components/AffiliatesList';
import Head from 'next/head';

const Affiliate = observer(() => {
    const [showFilters, setShowFilters] = useState(false);
    const filtersStore = useContext(affiliatesFiltersStoreContext);

    useEffect(() => {
        return () => filtersStore.changeFilter('name_lowercase', '');
    }, []);

    const toggleFilter = () => setShowFilters(state => !state);

    return (
        <>
            <Head>
                <title>Filiados</title>
            </Head>
            <TitleAndButtonWrapper>
                <Typography variant='h2' gutterBottom>
                    Filiados
                </Typography>

                <Link href='/filiados/add' passHref>
                    <Button css='height: fit-content' startIcon={<Add />} variant='outlined' color='primary'>
                        Adicionar
                    </Button>
                </Link>
            </TitleAndButtonWrapper>

            <Button onClick={toggleFilter} startIcon={<FilterListIcon />} variant='outlined' data-test-id='moreFilters'>
                MAIS FILTROS
            </Button>

            <StyledTextFieldWrapper>
                <StyledTextField
                    InputLabelProps={{ shrink: true }}
                    name='name_lowercase'
                    size='small'
                    variant='filled'
                    label='Buscar por nome'
                    onChange={e => {
                        filtersStore.changeFilter('name_lowercase', e.target.value!);
                        clearOthersInequalityUncontrolledInputs(e);
                    }}
                    inputProps={{
                        'data-sync-id': 'name_lowercase',
                        id: 'search',
                        autoComplete: 'off',
                        autoCorrect: 'off',
                        autoCapitalize: 'none',
                        spellCheck: 'false',
                    }}
                />
            </StyledTextFieldWrapper>

            {showFilters && <AffiliateFilters />}

            <AffiliatesList />
        </>
    );
});

export default GuardPage(ROLES.CONTENT_EDITOR, Affiliate);

const TitleAndButtonWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
`;

const StyledTextFieldWrapper = styled.div`
    padding: 16px 0;
`;

const StyledTextField = styled(TextField)`
    width: 100%;
    background-color: ${props => (props.theme.isDark ? 'transparent' : 'white')};
    border-radius: 4px;
`;
