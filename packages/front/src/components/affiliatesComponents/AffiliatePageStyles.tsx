import styled from 'styled-components';
import theme from 'theme.macro';
import React from 'react';
import { Typography } from '@material-ui/core';

export const AffTextBlock = styled.div`
    margin: ${theme.spacing(2)}px 0;
    background-color: ${theme.palette.background.paper};
    box-shadow: ${theme.shadows[1]};
    padding: ${theme.spacing(2)}px;
`;

export const AffFirstBlockDesk = styled(AffTextBlock)`
    display: flex;
    flex-direction: column;

    ${theme.breakpoints.up('sm')} {
        padding: 0;
        flex-direction: row;
    }
`;

export const AffPhoto = styled.img`
    width: 100%;
    display: block;
    height: auto;
    border-radius: 2px;

    ${theme.breakpoints.up('sm')} {
        max-width: 250px;
        max-height: 250px;
        margin-right: ${theme.spacing(2)}px;
    }
`;

export const AffLabel = styled.label`
    font-weight: 500;
`;

export const AffPhone = styled(Typography)`
    font-family: inherit;
    text-decoration: none;
    font-size: ${theme.typography.subtitle1.fontSize};
    color: ${theme.palette.text.primary};
`;
