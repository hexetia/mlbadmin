import dynamic from 'next/dynamic';
import '../utils/mobxNextjs';
import 'react-toastify/dist/ReactToastify.css';
import { Container, CssBaseline, Hidden, NoSsr } from '@material-ui/core';
import { StyleSheetManager, ThemeProvider as StyledThemeProvider } from 'styled-components';
import type { AppProps } from 'next/app';
import { SearchAppBar } from '../components/SearchAppBar';
import { NavigationMobile } from '../components/NavigationMobile';
import OccupationTabsWidget from '../components/occupationsComponents/OccupationTabsWidget';
import AffiliateTabsWidget from '../components/affiliatesComponents/AffiliateTabsWidget';
import { ToastContainer } from 'react-toastify';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { HideFromAnonymous } from '../components/HideFromAnonymous';
import { appTheme } from '../stores/themeStore';
import { observer } from 'mobx-react-lite';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StylesProvider, ThemeProvider as MuiThemeProvider } from '@material-ui/styles';
import Head from 'next/head';
import { useEffect } from 'react';

// needed to be created outside the render tree to cache works
const queryClient = new QueryClient();

const MyApp = observer(({ Component, pageProps }: AppProps) => {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').then(
                    function (registration) {
                        console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function (err) {
                        console.log('Service Worker registration failed: ', err);
                    }
                );
            });
        }
    });

    const theme = appTheme.get();

    return (
        <QueryClientProvider client={queryClient}>
            <StylesProvider injectFirst>
                <StyleSheetManager disableVendorPrefixes>
                    <StyledThemeProvider theme={theme}>
                        <MuiThemeProvider theme={theme}>
                            <Head>
                                <title>MLB App</title>
                            </Head>

                            <CssBaseline />

                            <NoSsr>
                                <Hidden smDown>
                                    <HideFromAnonymous>
                                        <SearchAppBar />
                                    </HideFromAnonymous>
                                </Hidden>
                            </NoSsr>

                            <Container>
                                <OccupationTabsWidget />
                                <AffiliateTabsWidget />

                                {/* margin to push content down when BottomNavigation is active */}
                                <div css='margin-bottom: 120px'>
                                    <Component {...pageProps} />
                                </div>

                                <NoSsr>
                                    <Hidden mdUp>
                                        <HideFromAnonymous>
                                            <NavigationMobile />
                                        </HideFromAnonymous>
                                    </Hidden>
                                </NoSsr>

                                <NoSsr>
                                    <ToastContainer />
                                    <ConfirmDialog />
                                </NoSsr>
                            </Container>
                        </MuiThemeProvider>
                    </StyledThemeProvider>
                </StyleSheetManager>
            </StylesProvider>
        </QueryClientProvider>
    );
});

// disable ssr in whole app, all pages
// @see https://stackoverflow.com/a/64509306/4279104
const disabledSsr = dynamic(() => Promise.resolve(MyApp), {
    ssr: false,
});

export default disabledSsr;
