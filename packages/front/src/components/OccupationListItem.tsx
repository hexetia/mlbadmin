import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { IOccupation } from '../../../../types/__project_defs/IOccupation';
import Link from 'next/link';
import numd from 'numd';

const OccupationListItemUnstyled = (props: { className?: string; occupation: IOccupation }) => (
    <Link href={`/ocupacoes/${props.occupation.id}`} passHref>
        <Paper variant='outlined' className={props.className} component='a' css='padding: 8px'>
            <Typography variant='h6'>{props.occupation.name}</Typography>
            <div>
                <Typography variant='subtitle2' display='inline'>
                    {numd(props.occupation.totalAffiliates || 0, 'Filiado', 'Filiados')}
                </Typography>
                <VerticalDivider>|</VerticalDivider>
                <Typography variant='subtitle2' display='inline'>
                    Iniciada em 2020
                </Typography>
            </div>
            <Typography variant='subtitle2'>{props.occupation.address.city + ' - ' + props.occupation.address.state}</Typography>
        </Paper>
    </Link>
);

const VerticalDivider = styled.span`
    padding: 0 10px;
    color: grey;
`;

export const OccupationListItem = styled(OccupationListItemUnstyled)`
    text-decoration: none;
    width: 100%;
    margin: 8px 0;

    & > .MuiPaper-root {
        padding: 8px;
    }

    ${props => props.theme.breakpoints.up('lg')} {
        width: 48%;
        margin: 12px 0;

        & > .MuiPaper-root {
            padding: 8px;
        }
    }
`;
