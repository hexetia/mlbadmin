import React from 'react';
import { TextField, TextFieldProps } from '@material-ui/core';
import { useId } from '../../../customHooks/useId';

/**
 * TextField that blocks the browser autocomplete
 * @param props
 * @constructor
 */
export const TextFieldOffAutocomplete = React.forwardRef(function (props: TextFieldProps, ref) {
    const randomID = useId();
    const inputProps = props.inputProps || {};

    return (
        <TextField
            ref={ref as any}
            inputProps={{
                id: `search-${randomID}`,
                autoComplete: randomID,
                autoCorrect: 'off',
                autoCapitalize: 'none',
                spellCheck: 'false',
                ...inputProps,
            }}
            margin='normal'
            fullWidth
            variant='outlined'
            {...props}
        />
    );
});
