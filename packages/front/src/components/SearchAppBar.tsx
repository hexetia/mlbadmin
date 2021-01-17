import React, { useContext, useRef } from 'react';
import { fade } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import { nanoid } from 'nanoid/non-secure';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import { toggleDarkTheme } from '../stores/themeStore';
import styled from 'styled-components';
import { authStore } from '../stores/authStore';
import { affiliatesFiltersStoreContext } from '../stores/affiliatesFiltersStore';
import { observer } from 'mobx-react-lite';
import AccountCircle from '@material-ui/icons/AccountCircle';
import { Avatar, Typography, AppBar, Toolbar, IconButton, InputBase, Menu, Button } from '@material-ui/core';
import Link from 'next/link';
import router from 'next/router';
import { useDebouncedCallback } from 'use-debounce';
import { changeSearchAppBarStore } from '../common/changeSearchAppBarStore';

const searchAppBarInputID = nanoid();

export function clearSearchAppBarInput() {
    const input = document.getElementById(searchAppBarInputID);
    if (input !== null) {
        (input as HTMLInputElement).value = '';
    }
}

export const SearchAppBar = observer(() => {
    const filtersStore = useContext(affiliatesFiltersStoreContext);
    const nameRef = useRef<HTMLInputElement | null>(null);

    /**
     * Redirect to affiliate page when necessary
     * and force focus on use of the page filter instead of the search appbar filter
     */
    const [handleChangeSearch] = useDebouncedCallback(
        (value: string) => changeSearchAppBarStore(nameRef.current!, filtersStore, value),
        500
    );

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const isMenuOpen = Boolean(anchorEl);
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuClick = () => {
        handleMenuClose();
        window.firebase
            .auth()
            .signOut()
            .then(() => {
                router.replace('/');
            });
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <div css={'padding: 24px;display: flex; align-items: center; outline: none;'}>
                <Avatar
                    src={authStore.user?.photoURL || undefined}
                    alt={authStore.user?.displayName || authStore.user?.email || undefined}
                />
                <Typography css='padding: 0 4px'>{authStore.user?.displayName || authStore.user?.email}</Typography>
            </div>
            <div css='text-align: center'>
                <Button onClick={handleMenuClick} variant='outlined'>
                    Sair
                </Button>
            </div>
        </Menu>
    );

    return (
        <Grow>
            <StyledAppBar position='static' color='default'>
                <Toolbar>
                    <SearchWrapper>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <InputBase
                            inputRef={nameRef}
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    if (location.pathname === '/filiados') {
                                        (document.querySelector('input[name="name_lowercase"]') as HTMLInputElement)?.focus();
                                    }
                                }
                            }}
                            onFocus={() => {}}
                            name='AffiliateNameSearchAppbar'
                            placeholder='Buscar por filiado...'
                            inputProps={{ 'aria-label': 'search', id: searchAppBarInputID }}
                            onChange={e => {
                                handleChangeSearch(e.target.value);
                            }}
                        />
                    </SearchWrapper>
                    <Grow />
                    <NavigationLinks>
                        <Link href='/' passHref>
                            <Button color='inherit'>INÍCIO</Button>
                        </Link>
                        {process.env.NODE_ENV !== 'production' && (
                            <Link href='/fake' passHref>
                                <Button color='inherit'>FAKE</Button>
                            </Link>
                        )}
                        <Link href='/ocupacoes' passHref>
                            <Button color='inherit'>OCUPAÇÕES</Button>
                        </Link>
                        <Link href='/filiados' passHref>
                            <Button color='inherit'>FILIADOS</Button>
                        </Link>
                        <Link href='/aniversariantes' passHref>
                            <Button color='inherit'>ANIVERSARIANTES</Button>
                        </Link>
                        <Link href='/usuarios' passHref>
                            <Button color='inherit'>USUÁRIOS</Button>
                        </Link>

                        <IconButton aria-label='show 4 new mails' title='Toggle light/dark theme' onClick={toggleDarkTheme} color='inherit'>
                            <Brightness4Icon />
                        </IconButton>

                        <IconButton onClick={handleProfileMenuOpen} color='inherit'>
                            <AccountCircle />
                        </IconButton>
                    </NavigationLinks>
                </Toolbar>
            </StyledAppBar>
            {renderMenu}
        </Grow>
    );
});

const Grow = styled.div`
    flex-grow: 1;
`;

const SearchWrapper = styled.div`
    position: relative;
    border-radius: ${props => props.theme.shape.borderRadius}px;
    background-color: ${props => fade(props.theme.palette.common.white, 0.15)};
    margin-right: ${props => props.theme.spacing(2)}px;
    margin-left: 0;
    width: 100%;
    color: ${props => (props.theme.palette.type === 'light' ? 'white' : undefined)};

    '&:hover': {
        background-color: ${props => fade(props.theme.palette.common.white, 0.25)};
    }

    ${props => props.theme.breakpoints.up('sm')} {
        width: auto;
    }

    & input {
        padding: ${props => props.theme.spacing(1, 1, 1, 0)};
        // vertical padding + font size from searchIcon
        padding-left: calc(1em + ${props => props.theme.spacing(4)}px);
        transition: ${props => props.theme.transitions.create('width')};
        width: 100%;
        ${props => props.theme.breakpoints.up('md')} {
            width: 20ch;
        }
    }

    & .MuiInputBase-root {
        color: inherit;
    }
`;

const SearchIconWrapper = styled.div`
    padding: ${props => props.theme.spacing(0, 2)};
    height: 100%;
    position: absolute;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const NavigationLinks = styled.div`
    display: flex;
`;

const StyledAppBar = styled(AppBar)`
    background: ${props => (props.theme.palette.type === 'light' ? 'linear-gradient(to right, #c02425, #f0cb35)' : props.theme.bg.level2)};
`;
