import { useDebouncedCallback } from 'use-debounce';
import { cepFillService } from '../common/cepFillService';
import { Controller, useWatch } from 'react-hook-form';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { CepMaskV2 } from './formCommon/Masks';
import { getStates } from '@brazilian-utils/brazilian-utils';
import type { FieldErrors } from 'react-hook-form';
import { ControllerAutocompleteCity } from './formCommon/integrations/ControllerAutocompleteCity';
import { HookFormMuiNativeSelect } from './formCommon/integrations/HookFormMuiNativeSelect';
import { useId } from '../customHooks/useId';
import cepFillStore from '../stores/cepFillStore';
import CepLoadingIndicador from './CepLoadingIndicador';
import { ErrorMessage } from '@hookform/error-message';
import { observer } from 'mobx-react-lite';
import { TextFieldOffAutocomplete } from './formCommon/fields/TextFieldOffAutocomplete';
import styled from 'styled-components';

interface AddressProps {
    allowAutoFillAddress?: boolean;
    setFormValue: any;
    control: any;
    errors: FieldErrors<any>;
    formState: any;
    stateRequired?: boolean;
    cityRequired?: boolean;
}

export const AddressFields = observer((props: AddressProps) => {
    const [debounceFillWithCep] = useDebouncedCallback(cepFillService(props.setFormValue), 1000);
    const cepID = useId();

    const useOccupationAddress: boolean | undefined = useWatch({
        name: 'useOccupationAddress',
        control: props.control,
    });

    const showAutoFilledFields: boolean = useOccupationAddress === false || props.allowAutoFillAddress === undefined;

    return (
        <>
            {props.allowAutoFillAddress && (
                <>
                    <FormGroup>
                        <Controller
                            name='useOccupationAddress'
                            control={props.control}
                            render={({ onChange, onBlur, value, name }) => (
                                <StyledFormControlLabel
                                    control={
                                        <Switch
                                            name={name}
                                            checked={value}
                                            onChange={e => onChange(e.target.checked)}
                                            onBlur={onBlur}
                                            color='secondary'
                                        />
                                    }
                                    label='Usar mesmo endereço da ocupação'
                                />
                            )}
                        />
                    </FormGroup>
                    <Typography display='block' variant='caption' css={'padding-bottom: 22px'}>
                        * exceto número da casa e complemento
                    </Typography>
                </>
            )}

            {showAutoFilledFields && (
                <>
                    <Controller
                        control={props.control}
                        name='address.cep'
                        defaultValue=''
                        render={({ onChange, ...rest }) => (
                            <TextField
                                label='CEP'
                                fullWidth
                                margin='normal'
                                variant='outlined'
                                error={cepFillStore.get() === 'error'}
                                helperText={
                                    cepFillStore.get() === 'error'
                                        ? 'CEP incorreto'
                                        : 'Alguns dados de endereço poderão ser preenchidos com o CEP'
                                }
                                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                                    debounceFillWithCep(evt.target.value);
                                    onChange(evt.target.value);
                                }}
                                InputProps={{
                                    inputComponent: CepMaskV2,
                                }}
                                inputProps={{
                                    'data-testid': 'input-field',
                                    autoComplete: cepID,
                                }}
                                {...rest}
                            />
                        )}
                    />
                    <ErrorMessage errors={props.errors} name='address.cep' />

                    <CepLoadingIndicador />

                    <HookFormMuiNativeSelect
                        errors={props.errors}
                        control={props.control}
                        formState={props.formState}
                        defaultValue=''
                        label='Estado'
                        margin='normal'
                        name='address.state'
                        required={props.stateRequired}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                            props.control.setValue('address.state', event.target.value);
                            props.control.setValue('address.city', '');
                        }}
                    >
                        <option value='' />
                        {getStates().map(state => (
                            <option key={state.code} value={state.name}>
                                {state.name}
                            </option>
                        ))}
                    </HookFormMuiNativeSelect>

                    <ControllerAutocompleteCity
                        name='address.city'
                        required={props.cityRequired}
                        errors={props.errors}
                        control={props.control}
                        formState={props.formState}
                    />

                    <Controller
                        as={TextFieldOffAutocomplete}
                        control={props.control}
                        defaultValue=''
                        name='address.neighborhood'
                        label='Bairro'
                        variant='outlined'
                        fullWidth
                        margin='normal'
                    />
                    <Controller
                        as={TextFieldOffAutocomplete}
                        defaultValue=''
                        control={props.control}
                        name='address.street'
                        label='Rua'
                        variant='outlined'
                        fullWidth
                        margin='normal'
                        helperText='Exemplo: Rua Fulana de Tal'
                    />
                </>
            )}

            <Controller
                as={TextFieldOffAutocomplete}
                defaultValue=''
                control={props.control}
                name='address.number'
                label='Número'
                variant='outlined'
                fullWidth
                margin='normal'
            />
            <Controller
                as={TextFieldOffAutocomplete}
                defaultValue=''
                control={props.control}
                name='address.complement'
                label='Complemento'
                variant='outlined'
                fullWidth
                margin='normal'
            />
        </>
    );
});

const StyledFormControlLabel = styled(FormControlLabel)`
    color: ${props => props.theme.palette.text.primary};
`;
