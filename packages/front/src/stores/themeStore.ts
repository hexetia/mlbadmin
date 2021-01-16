import grey from '@material-ui/core/colors/grey';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import responsiveFontSizes from '@material-ui/core/styles/responsiveFontSizes';
import { observable, runInAction } from 'mobx';

const makeLightTheme = () =>
    responsiveFontSizes(
        createMuiTheme({
            props: {
                MuiTypography: {
                    color: 'textPrimary',
                },
            },
            palette: {
                type: 'light',
            },
            isDark: false,
            bg: {
                level1: '#fff',
                level2: grey[100],
            },
            unstable_strictMode: true,
        })
    );

const makeDarkTheme = () =>
    responsiveFontSizes(
        createMuiTheme({
            props: {
                MuiTypography: {
                    color: 'textPrimary',
                },
            },
            palette: {
                type: 'dark',
                primary: blue,
                secondary: pink,
            },
            isDark: true,
            bg: {
                level1: grey[900],
                level2: '#333',
            },
            unstable_strictMode: true,
        })
    );

if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches &&
    localStorage.getItem('theme.dark') === null
) {
    localStorage.setItem('theme.dark', 'yes');
}

const storage: Storage | null = typeof window !== 'undefined' ? localStorage : null;

export const appTheme = observable.box(storage?.getItem('theme.dark') === 'yes' ? makeDarkTheme() : makeLightTheme(), {
    deep: false,
});

/**
 * Não da pra somente trocar um tema por outro, o material-ui precisa que o tema seja criado
 * novamente, ou alguns estlilos não serão aplicados, acho que por cache interno no framework...
 */
export const toggleDarkTheme = () => {
    runInAction(() => {
        if (appTheme.get().isDark) {
            localStorage.removeItem('theme.dark');
            appTheme.set(makeLightTheme());
        } else {
            localStorage.setItem('theme.dark', 'yes');
            appTheme.set(makeDarkTheme());
        }
    });
};
