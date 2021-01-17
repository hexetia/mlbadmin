import React from 'react';
import { ROLES } from '../enums/ROLES';
import { observer } from 'mobx-react-lite';
import { authStatus, hasRole } from '../stores/authStore';
import Login from './Login';
import { AUTH_STATUS_ENUM } from '../enums/AUTH_STATUS_ENUM';
import { Button, Typography } from '@material-ui/core';
import { AnimatedDot } from '../components/AnimatedDot';
import router from 'next/router';

type GuardParams = (role: ROLES, Component: React.FunctionComponent<any>) => React.ReactNode;

/**
 * Guard page by checking role in authStore
 *
 */
export const GuardPage: GuardParams = (role, Component) =>
    observer(function GuardPage() {
        const handleLogout = () => {
            window.firebase
                .auth()
                .signOut()
                .then(() => {
                    router.replace('/');
                });
        };

        if (hasRole(role)) {
            return <Component />;
        } else if (authStatus() === AUTH_STATUS_ENUM.LOGGED) {
            return (
                <div css='padding: 24px'>
                    <div css='padding: 20px'>
                        <Typography variant='h3'>
                            Buscando sua identidade no sistema <AnimatedDot>.</AnimatedDot>
                            <AnimatedDot>.</AnimatedDot>
                            <AnimatedDot>.</AnimatedDot>
                        </Typography>

                        <Button onClick={handleLogout} variant='contained' color='primary'>
                            Cancelar
                        </Button>
                    </div>
                </div>
            );
        } else {
            return <Login />;
        }
    });
