import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React from 'react';
import { Theme } from '@material-ui/core';
import { AppLink } from './AppLink';
import { ParsedUrlQuery } from 'querystring';

export const SharedViewAndEditTabs = (props: { routePrefix: string; params: ParsedUrlQuery }) => {
    const showTabs = !location.pathname.includes('/add');

    const mapping = {
        [`${props.routePrefix}/${props?.params.id}`]: 0,
        [`${props.routePrefix}/${props?.params.id}/edit`]: 1,
        [`${props.routePrefix}/${props?.params.id}/aniversariantes`]: 2,
    };

    return showTabs ? (
        <AppBar
            position='relative'
            color='transparent'
            elevation={0}
            css={`
                color: ${(props: { theme: Theme }) => (props.theme.isDark ? 'white' : 'black')};
            `}
        >
            <Tabs value={mapping[location.pathname]} aria-label='simple tabs example'>
                <Tab component={AppLink} href={Object.keys(mapping)[0]} label='Ver' />
                <Tab component={AppLink} href={Object.keys(mapping)[1]} label='Editar' />
                {location.pathname.includes('/ocupacoes') && (
                    <Tab component={AppLink} href={Object.keys(mapping)[2]} label='Aniversariantes' />
                )}
            </Tabs>
        </AppBar>
    ) : null;
};

export default SharedViewAndEditTabs;
