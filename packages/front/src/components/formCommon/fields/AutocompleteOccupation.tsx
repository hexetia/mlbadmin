import React, { useState } from 'react';
import { CircularProgress, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { useId } from '../../../customHooks/useId';
import { IOccupation } from '../../../../../../types/__project_defs/IOccupation';
import { useQuery } from 'react-query';
import { useDebounce } from 'use-debounce';
import type { AutocompleteChangeDetails, AutocompleteChangeReason } from '@material-ui/lab/useAutocomplete/useAutocomplete';
import { queryMatchingOccupations } from './queryMatchingOccupations';

interface Props<T> {
    name: string;
    margin?: 'none' | 'dense' | 'normal';
    value?: null | IOccupation;
    onChange: (
        event: React.ChangeEvent<{}>,
        value: null | IOccupation,
        reason: AutocompleteChangeReason,
        details?: AutocompleteChangeDetails<T>
    ) => void;
}

export const AutocompleteOccupation = ({ margin = 'normal', ...props }: Props<IOccupation>) => {
    const [text, setText] = useState('');
    const [open, setOpen] = React.useState(false);
    const randomID = useId();
    const [textDebounced] = useDebounce(text, 500);

    const { data } = useQuery<IOccupation[]>(['form_autocompleteOcupacao', textDebounced], queryMatchingOccupations, {});

    const options: IOccupation[] = data || [];

    return (
        <Autocomplete
            {...props}
            fullWidth
            autoHighlight
            noOptionsText={text.trim() === '' ? 'Digite o nome da ocupação' : 'Sem resultados'}
            loadingText={'Carregando...'}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            getOptionSelected={(option, value) => option.name === value.name}
            getOptionLabel={option => option.name}
            options={options}
            loading={!data && open}
            onChange={props.onChange}
            onInputChange={(event: object, value: string, reason: string) => {
                // don't call the api request when user choose a value, only call api when user input the value
                if (reason === 'input') {
                    setText(value);
                } else if (['reset', 'clear'].indexOf(reason) !== -1) {
                    setText('');
                }
            }}
            renderInput={params => (
                <TextField
                    {...params}
                    margin={margin}
                    label='Ocupação'
                    variant='outlined'
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {!data && open ? <CircularProgress color='inherit' size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                    inputProps={{
                        ...params.inputProps,
                        name: props.name,
                        'data-lpignore': true,
                        autoComplete: randomID,
                    }}
                />
            )}
        />
    );
};
