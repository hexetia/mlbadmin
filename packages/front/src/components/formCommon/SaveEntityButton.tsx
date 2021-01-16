import React from 'react';
import styled from 'styled-components';
import { Button, ButtonProps, CircularProgress } from '@material-ui/core';

interface Props extends ButtonProps {
    isSubmitting: boolean;
}

export const SaveEntityButton = ({ isSubmitting, onClick }: Props) => {
    return (
        <SaveActionWrapper>
            <Button type='submit' color='primary' variant='outlined' disabled={isSubmitting} onClick={onClick}>
                Salvar
            </Button>
            {isSubmitting && (
                <CircularProgress size={24} style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }} />
            )}
        </SaveActionWrapper>
    );
};

const SaveActionWrapper = styled.span`
    margin: ${props => props.theme.spacing(1)};
    position: relative;
`;
