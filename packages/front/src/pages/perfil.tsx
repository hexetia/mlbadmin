import { authStatus, authStore } from '../stores/authStore';
import { Avatar, Button, Container, Typography } from '@material-ui/core';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import { AUTH_STATUS_ENUM } from '../enums/AUTH_STATUS_ENUM';
import Link from 'next/link';
import router from 'next/router';
import { ROLES } from '../enums/ROLES';
import { GuardPage } from '../security/GuardPage';
import { appTheme, toggleDarkTheme } from '../stores/themeStore';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import React from 'react';

const Profile = observer(() => (
    <Wrapper>
        <DataSection>
            <div css='display: flex;align-items: center'>
                <Avatar src={authStore.user?.photoURL!} variant='rounded' css='margin-right: 8px' />
                <div>
                    <Typography variant='h5'>{authStore.user?.displayName}</Typography>
                    <Typography variant='caption'>{authStore.user?.email}</Typography>
                </div>
            </div>
        </DataSection>

        <ProfileMenuItem onClick={() => toggleDarkTheme()}>
            <Typography>{appTheme.get().isDark ? 'Modo claro' : 'Modo escuro'}</Typography>
            <Brightness4Icon />
        </ProfileMenuItem>

        <div css='margin-top: 40px;' />

        <Link href='/usuarios' css='text-decoration: none; width: 100%' passHref>
            <ProfileMenuItem>
                <Typography>Generenciar usuários</Typography>
                <ArrowForwardIosIcon />
            </ProfileMenuItem>
        </Link>

        {authStatus() === AUTH_STATUS_ENUM.LOGGED && (
            <ProfileMenuItem
                onClick={() => {
                    window.firebase
                        .auth()
                        .signOut()
                        .then(() => {
                            router.replace('/');
                        });
                }}
            >
                <Typography>Sair</Typography>
            </ProfileMenuItem>
        )}
    </Wrapper>
));

export default GuardPage(ROLES.CONTENT_EDITOR, Profile);

const Wrapper = styled(Container)`
    display: flex;
    flex-direction: column;
`;

const DataSection = styled.div`
    width: 100%;
    padding-top: 24px;
`;

const ProfileMenuItem = styled(Button)`
    padding: 16px;
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    background-color: ${props => props.theme.palette.background.paper};
    box-shadow: ${props => props.theme.shadows[2]};
`;
