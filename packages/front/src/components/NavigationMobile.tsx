import React, { memo, useEffect } from 'react';
import when from 'when-expression';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import HomeWork from '@material-ui/icons/HomeWork';
import FavoriteIcon from '@material-ui/icons/People';
import styled from 'styled-components';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { NextRouter } from 'next/dist/next-server/lib/router/router';
import { AppLink } from './AppLink';
import { useClientRouter } from 'use-client-router';

const routeActive = (router: NextRouter): number =>
    when(router.pathname)({
        '/': 0,
        '/ocupacoes': 1,
        '/filiados': 2,
        '/perfil': 3,
        else: 4,
    });

export const NavigationMobile = memo(() => {
    const router = useClientRouter();
    const [value, setValue] = React.useState(() => routeActive(router));

    useEffect(() => {
        setValue(routeActive(router));
    }, [router.pathname]);

    return (
        <StyledBottomNavigation
            value={value}
            onChange={(event, newValue) => {
                setValue(newValue);
            }}
            showLabels
        >
            <BottomNavigationAction component={AppLink} href='/' passHref label='Dashboard' icon={<EqualizerIcon />} showLabel={true} />
            <BottomNavigationAction component={AppLink} href='/ocupacoes' label='Ocupações' icon={<HomeWork />} showLabel={true} />
            <BottomNavigationAction component={AppLink} href='/filiados' label='Filiados' icon={<FavoriteIcon />} showLabel={true} />
            <BottomNavigationAction component={AppLink} href='/perfil' label='Meu Perfil' icon={<AccountCircle />} showLabel={true} />
        </StyledBottomNavigation>
    );
});

const StyledBottomNavigation = styled(BottomNavigation)`
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 666;
`;
