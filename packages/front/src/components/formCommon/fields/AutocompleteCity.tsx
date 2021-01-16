import React from 'react';
import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@material-ui/lab/useAutocomplete/useAutocomplete';
import { useId } from '../../../customHooks/useId';
import { estadosIbge } from '../../../utils/estados';
import { QueryFunctionContext, useQuery } from 'react-query';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CircularProgress, TextField } from '@material-ui/core';
import fetch from 'cross-fetch';

interface CityType {
    nome: string;
}

const fetcherCities = (context: QueryFunctionContext) => {
    if (context.queryKey[1] === undefined) {
        return [];
    }

    return fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${context.queryKey[1]}/municipios`).then(r =>
        r.json().then(response => response.map((city: CityType) => city.nome))
    );
};

export const AutocompleteCity = (props: {
    name: string;
    margin: 'none' | 'dense' | 'normal';
    value?: null | string;
    estado: string;
    onChange: (
        event: React.ChangeEvent<{}>,
        value: null | string,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails
    ) => void;
    error?: boolean;
    required?: boolean;
    helperText?: React.ReactNode;
}) => {
    const [open, setOpen] = React.useState(false);
    const randomID = useId();

    const estadoID = !isNaN(parseInt(props.estado))
        ? props.estado
        : estadosIbge.filter(estadoIBGE => estadoIBGE.nome === props.estado)[0]?.id;

    const { data, error, isLoading } = useQuery<string[]>(['cidades', estadoID], fetcherCities, { cacheTime: 1000 * 60 * 60 });

    return (
        <Autocomplete
            autoHighlight
            fullWidth
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            options={data || []}
            loading={isLoading}
            onChange={props.onChange}
            value={props.value !== '' ? props.value : null}
            noOptionsText='Selecione um estado antes'
            renderInput={params => (
                <TextField
                    {...params}
                    error={props.error}
                    helperText={props.helperText}
                    label='Cidade'
                    name={props.name}
                    variant='outlined'
                    required={props.required}
                    margin='normal'
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {isLoading ? <CircularProgress color='inherit' size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: randomID,
                    }}
                />
            )}
        />
    );
};
