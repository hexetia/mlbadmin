import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { AutocompleteCity } from '../fields/AutocompleteCity';
import { handleFocus } from '../handleFocus';

// bug ao esconder o formulário e mudar de estado, quando volta a aparecer o form misteriosamente não requisita o estado correto
export function ControllerAutocompleteCity(props: { name: string; formState: any; errors: any; control: any; required?: boolean }) {
    const estado = useWatch({
        control: props.control,
        name: 'address.state',
    });

    return (
        <Controller
            control={props.control}
            onFocus={handleFocus(props.name)}
            name={props.name}
            defaultValue=''
            render={({ ref, ...hookProps }) => (
                <AutocompleteCity
                    {...hookProps}
                    margin='normal'
                    required={props.required}
                    estado={estado as string}
                    onChange={(_, value: string | null) => {
                        props.control.setValue(hookProps.name, value);
                    }}
                    error={Boolean(props.errors[props.name]?.message)}
                    helperText={<ErrorMessage errors={props.errors} name={hookProps.name} />}
                />
            )}
        />
    );
}
