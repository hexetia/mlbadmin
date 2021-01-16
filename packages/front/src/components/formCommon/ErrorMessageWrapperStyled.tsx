import React from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { Typography } from '@material-ui/core';
import { ReactFitty } from '../ReactFitty';
import type { Variant } from '@material-ui/core/styles/createTypography';
import type { FieldErrors } from 'react-hook-form';

interface Props {
    gutterBottom?: boolean;
    name: string;
    errors?: FieldErrors<any> | undefined;
    children?: React.ReactNode;
    variant?: Variant;
}

export const ErrorMessageWrapperStyled = ({ name, errors, gutterBottom, children, variant }: Props) => {
    return (
        <ErrorMessage
            errors={errors}
            name={name}
            render={data => (
                <Typography css='margin-bottom: 16px' variant={variant} color='error' component={ReactFitty}>
                    {data.message}
                </Typography>
            )}
        />
    );
};
