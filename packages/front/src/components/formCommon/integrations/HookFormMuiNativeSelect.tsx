import React from 'react';
import type { FieldErrors } from 'react-hook-form';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import { Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { useId } from '../../../customHooks/useId';
import { handleFocus } from '../handleFocus';

export const HookFormMuiNativeSelect = (props: {
    control: any;
    label: string;
    children: React.ReactNode;
    name: string;
    errors: FieldErrors<any>;
    formState: any;
    margin?: 'none' | 'dense' | 'normal';
    required?: boolean;
    onChange?: any;
    defaultValue?: any;
}) => {
    const id = useId();

    const inputLabel = React.useRef<HTMLLabelElement>(null);
    const [labelWidth, setLabelWidth] = React.useState(0);
    React.useEffect(() => {
        setLabelWidth(inputLabel.current!.offsetWidth);
    }, []);

    return (
        <FormControl
            variant='outlined'
            fullWidth
            margin={props.margin}
            required={props.required}
            error={Boolean(props.errors[props.name]?.message)}
        >
            <InputLabel ref={inputLabel} htmlFor={id} children={props.label} />

            <Controller
                name={props.name}
                onFocus={handleFocus(props.name)}
                control={props.control}
                required
                defaultValue={props.defaultValue}
                render={hookFormProps => {
                    return (
                        <Select
                            native
                            labelWidth={labelWidth}
                            inputProps={{ id }}
                            {...hookFormProps}
                            onChange={props.onChange || hookFormProps.onChange}
                        >
                            {props.children}
                        </Select>
                    );
                }}
            />

            <FormHelperText>
                <ErrorMessage errors={props.errors} name={props.name} />
            </FormHelperText>
        </FormControl>
    );
};
