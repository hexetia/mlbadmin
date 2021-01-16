import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { estados } from '../../utils/estados';
import { useId } from '../../customHooks/useId';
import { IOccupationFilters, occupationsFiltersStoreContext, resetOccupationFilters } from '../../stores/occupationsFiltersStore';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { AutocompleteCity } from '../formCommon/fields/AutocompleteCity';

export const OccupationsFilters = observer(() => {
    const id = useId();
    const store = useContext(occupationsFiltersStoreContext);

    useEffect(() => {
        return () => {
            resetOccupationFilters();
        };
    }, []);

    return (
        <Wrapper>
            <TextField
                onChange={e => {
                    store.debounceChangeFilter(e.target.name as 'name_lowercase', e.target.value);
                }}
                variant='outlined'
                name='name_lowercase'
                label='Nome'
                margin='normal'
                inputProps={{ autoComplete: id }}
            />
            <FormControl variant='outlined' margin='normal'>
                <InputLabel htmlFor='outlined-age-native-simple'>Estado</InputLabel>
                <Select
                    native
                    onChange={e => store.changeFilter(e.target.name! as keyof IOccupationFilters, e.target.value as string)}
                    label='Estado'
                    inputProps={{
                        name: 'address.state',
                        id: 'outlined-age-native-simple',
                        autoComplete: id,
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
                estado={store['address.state'].value}
                margin='normal'
                value={store['address.city'].value}
                onChange={(e, value: string | null) => {
                    runInAction(() => store.changeFilter('address.city', value || ''));
                }}
            />
        </Wrapper>
    );
});

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    & > .MuiFormControl-root {
        width: 100%;
    }

    ${props => props.theme.breakpoints.up('md')} {
        & {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-gap: 15px;
        }
    }
`;
