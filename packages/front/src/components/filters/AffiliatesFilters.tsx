import React, { useContext, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

import styled from 'styled-components';
import { estados } from '../../utils/estados';
import { useId } from '../../customHooks/useId';
import type { IOccupation } from '../../../../../types/__project_defs/IOccupation';
import { CPFMask } from '../formCommon/Masks';
import { AutocompleteOccupation } from '../formCommon/fields/AutocompleteOccupation';
import { observer } from 'mobx-react-lite';
import {
    affiliatesFiltersStoreContext,
    affiliatesFiltersStoreInequalityFilters,
    IAffiliatesFilters,
    resetAffiliatesFiltersStore,
} from '../../stores/affiliatesFiltersStore';
import { AutocompleteCity } from '../formCommon/fields/AutocompleteCity';

export const clearOthersInequalityUncontrolledInputs = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.persist();
    const currentFilter = e.target.name as keyof IAffiliatesFilters;

    const anotherFilters = affiliatesFiltersStoreInequalityFilters.filter(value => value !== currentFilter);
    for (const key of anotherFilters) {
        const input: HTMLInputElement | null = document.querySelector(`input[data-sync-id="${key}"]`);
        if (input !== null) {
            input.value = '';
        }
    }
};

export const AffiliateFilters = observer(() => {
    const filtersStore = useContext(affiliatesFiltersStoreContext);
    const id = useId();

    useEffect(() => {
        return () => {
            resetAffiliatesFiltersStore();
        };
    }, []);

    return (
        <Wrapper id='affiliatesFiltersWrapper'>
            {!location.pathname.includes('/filiados') && (
                <TextField
                    onChange={e => {
                        filtersStore.debounceChangeFilter(e.target.name as keyof IAffiliatesFilters, e.target.value!);
                        clearOthersInequalityUncontrolledInputs(e);
                    }}
                    variant='outlined'
                    name='name_lowercase'
                    label='Nome'
                    margin='normal'
                    inputProps={{ autoComplete: id, 'data-sync-id': 'name_lowercase' as keyof IAffiliatesFilters }}
                    InputLabelProps={{ shrink: true }}
                />
            )}
            <TextField
                InputLabelProps={{ shrink: true }}
                InputProps={{
                    inputComponent: CPFMask,
                }}
                data-sync-id={'cpf' as keyof IAffiliatesFilters}
                inputProps={{ maskPlaceholder: null, autoComplete: id, 'data-sync-id': 'cpf' as keyof IAffiliatesFilters }}
                onChange={e => {
                    filtersStore.debounceChangeFilter(e.target.name as keyof IAffiliatesFilters, e.target.value!);
                    clearOthersInequalityUncontrolledInputs(e);
                }}
                variant='outlined'
                name='cpf'
                label='CPF'
                margin='normal'
            />
            <TextField
                InputLabelProps={{ shrink: true }}
                data-sync-id={'rg' as keyof IAffiliatesFilters}
                onChange={e => {
                    filtersStore.debounceChangeFilter(e.target.name as keyof IAffiliatesFilters, e.target.value!);
                    clearOthersInequalityUncontrolledInputs(e);
                }}
                variant='outlined'
                name='rg'
                label='RG'
                margin='normal'
                inputProps={{ autoComplete: id, 'data-sync-id': 'rg' as keyof IAffiliatesFilters }}
            />

            {location.pathname.includes('/filiados') && (
                <>
                    <AutocompleteOccupation
                        name='occupationId'
                        onChange={(_, value: IOccupation | null) => {
                            filtersStore.changeFilter('occupationId', value?.id || '');
                        }}
                        margin='normal'
                    />

                    <FormControl variant='outlined' fullWidth margin='normal'>
                        <InputLabel htmlFor='outlined-age-native-simple'>Estado</InputLabel>
                        <Select
                            native
                            onChange={e => filtersStore.changeFilter(e.target.name as any, e.target.value as string)}
                            label='Estado'
                            inputProps={{
                                name: 'address.state',
                                id: 'outlined-age-native-simple',
                            }}
                        >
                            <option aria-label='Nenhum' value='' />
                            {Object.values(estados).map(uf => (
                                <option key={uf} value={uf}>
                                    {uf}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <AutocompleteCity
                        name='address.city'
                        estado={filtersStore['address.state'].value as string}
                        margin='normal'
                        value={filtersStore['address.city'].value as string}
                        onChange={(_, value: string | null) => {
                            filtersStore.changeFilter('address.city', value || '');
                        }}
                    />
                </>
            )}
        </Wrapper>
    );
});

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    & > .MuiTextField-root {
        width: 100%;
    }

    ${props => props.theme.breakpoints.up('md')} {
        & {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-gap: 15px;
        }

        //& .MuiFormControl-marginNormal {
        //    margin-top: 0;
        //    margin-bottom: 0;
        //}
    }
`;
