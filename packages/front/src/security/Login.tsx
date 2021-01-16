import React, { useEffect, useRef, useState } from 'react';
import firebase from 'firebase/app';
import { authStatus, authStore, hasRole, resetAuthStore } from '../stores/authStore';
import { GoogleLogo } from '../icons/GoogleLogo';
import { Button, TextField, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { ROLES } from '../enums/ROLES';
import { AUTH_STATUS_ENUM } from '../enums/AUTH_STATUS_ENUM';
import { AnimatedDot } from '../components/AnimatedDot';
import router from 'next/router';
import { FireUser } from '../../../../types/__external_defs/firebase-complements';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async/fixed';
import { fireApp } from '../firebase/fireApp';
import { toast } from 'react-toastify';
import { runInAction } from 'mobx';
import { createGlobalStyle } from 'styled-components';

const provider = new firebase.auth.GoogleAuthProvider();

const LoginGlobalStyle = createGlobalStyle`
    body {
        background-color: #bd383d;
    }
`;

const Login = observer(() => {
    const testEmailRef = useRef('');

    useEffect(() => {
        if (hasRole(ROLES.CONTENT_EDITOR)) {
            router.replace('/');
        }
    }, [authStore.role, authStore.user]);

    const handleLogout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                router.replace('/');
            });
    };

    const handleLogin = async (type: 'test' | 'production', customEmail?: string) => {
        try {
            if (type === 'production') {
                firebase
                    .auth()
                    .signInWithPopup(provider)
                    .catch(function () {
                        // Handle Errors here.
                        // The email of the user's account used.
                        // The firebase.auth.AuthCredential type that was used.
                        // ...
                    });
            } else {
                const mail = customEmail!;

                const userInfo = {
                    sub: mail,
                    email: mail,
                    email_verified: true,
                };

                try {
                    await firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(JSON.stringify(userInfo)));
                } catch (e) {
                    console.log('cath onClickLogin', e.message);
                }
            }
        } catch (e) {}
    };

    if (authStatus() === AUTH_STATUS_ENUM.UNKNOW) {
        return null;
    }

    return (
        <div css='width: 100%;text-align: center'>
            <LoginGlobalStyle />
            <div css='text-align: center'>
                <img css='margin-top: 10vh;' width={150} alt='' src={'/logo.png'} />
            </div>

            {authStatus() === AUTH_STATUS_ENUM.LOGGED && !hasRole(ROLES.CONTENT_EDITOR) && (
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
            )}

            <div>
                {authStatus() === AUTH_STATUS_ENUM.DISCONNECTED && (
                    <>
                        <div>
                            <Button
                                data-testid='loginButton'
                                startIcon={<GoogleLogo width={18} height={18} />}
                                variant='contained'
                                onClick={() => handleLogin('production')}
                            >
                                Entrar com o Google
                            </Button>
                        </div>

                        {process.env.NODE_ENV !== 'production' && (
                            <div>
                                <TextField data-testid='testLoginEmail' onChange={e => (testEmailRef.current = e.target.value)} />
                                <Button data-testid='testLoginButton' onClick={() => handleLogin('test', testEmailRef.current)}>
                                    Entrar com email customizado
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});

let refreshClaimsIntervalHolder: any;

async function refreshClaimsUntilUserIsRecognized(user: FireUser) {
    refreshClaimsIntervalHolder = setIntervalAsync(async () => {
        try {
            const role: string = (await user?.getIdTokenResult(true))?.claims?.role || '';

            if (authStore.role != role) {
                runInAction(() => {
                    authStore.role = role;
                });
            }
        } catch (e) {
            if (e.code.includes('auth/internal-error')) {
                resetAuthStore();
                await fireApp.auth().signOut();
                toast.info('Infelizmente você não possui um convite de acesso');
            }
        }
    }, 2000);
}

fireApp.auth().onAuthStateChanged(
    async user => {
        if (user == null) {
            await fireApp.auth().signOut();
            resetAuthStore();
            // no need do handle that error, its mostly some complaim about clearing interval on undefined
            clearIntervalAsync(refreshClaimsIntervalHolder).catch(() => {});
        } else {
            /**
             * We need to call getIdTokenResult to get user Custom Claims, that data don't come with User object
             * claims is part of the Security Access in this frontend app
             */
            let role: string = '';
            try {
                role = (await user?.getIdTokenResult())?.claims?.role || '';
            } catch (e) {}

            runInAction(() => {
                authStore.user = user;
                authStore.role = role;
            });

            if ((Object.values(ROLES) as string[]).includes(authStore.role)) {
                clearIntervalAsync(refreshClaimsIntervalHolder).catch(() => {});
            } else {
                // no need do handle that error, its mostly some complaim about clearing interval on undefined
                refreshClaimsUntilUserIsRecognized(user);
            }
        }
    },
    error => {
        console.log(error);
    }
);

export default Login;
