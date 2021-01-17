import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
    render() {
        return (
            <Html lang='pt-br'>
                <Head>
                    {/* PWA primary color */}
                    {/*<meta name='theme-color' content={themeStore.theme.palette.primary.main} />*/}
                    <link rel='manifest' href='/manifest.json' />
                    <link rel='apple-touch-icon' href='/logo192.png' />
                    <meta name='theme-color' content='#000000' />
                    <script src='/__/firebase/8.2.3/firebase-app.js' />
                    <script src='/__/firebase/8.2.3/firebase-auth.js' />
                    <script src='/__/firebase/8.2.3/firebase-firestore.js' />
                    <script src='/__/firebase/8.2.3/firebase-functions.js' />
                    <script src='/__/firebase/8.2.3/firebase-storage.js' />
                    <script src='/__/firebase/init.js' />
                </Head>
                <body>
                    <Main />

                    <NextScript />
                </body>
            </Html>
        );
    }
}
