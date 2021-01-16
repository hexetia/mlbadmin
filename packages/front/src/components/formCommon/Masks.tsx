import React from 'react';
import InputMask from 'react-input-mask';
import { InputMask as NewMask } from 'react-masked';

export const CPFMask = (props: any) => {
    const { inputRef, defaultValue, ...rest } = props;
    return <InputMask mask='999.999.999-99' maskPlaceholder={null} ref={inputRef} {...rest} />;
};

/**
 * Até onde testei come algum caracteres no mobile no meio da digitação ou quando ta apagando
 */
export const CPFMaskV2 = (props: any) => {
    const { inputRef, ...rest } = props;
    return <NewMask clearIfNotMatch={true} mask='999.999.999-99' ref={inputRef} {...rest} />;
};

export const CelularMask = (props: any) => {
    const { inputRef, defaultValue, ...rest } = props;
    return <InputMask mask='99 9 9999-9999' maskPlaceholder={null} ref={inputRef} {...rest} />;
};

export const DataNascimentoMask = (props: any) => {
    const { inputRef, defaultValue, ...rest } = props;
    return <InputMask mask='99/99/9999' maskPlaceholder={null} ref={inputRef} {...rest} />;
};

export const CepMaskV2 = (textFieldProps: any) => {
    const { inputRef, defaultValue, ...rest } = textFieldProps;
    return <InputMask mask='99999-999' maskPlaceholder={null} ref={inputRef} {...rest} />;
};

/**
 * Tem um bug chato de que quando você deleta uma parte do meio do valor do campo, o final do campo também é apagado
 * @param textFieldProps
 * @constructor
 */
export const CepMaskV3 = (textFieldProps: any) => {
    const { inputRef, ...rest } = textFieldProps;
    return <NewMask mask='99999-999' ref={inputRef} {...rest} />;
};
