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
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
