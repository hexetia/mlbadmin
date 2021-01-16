import { Theme, ThemeOptions } from '@material-ui/core/styles/createMuiTheme';

declare module '@material-ui/core/styles/createMuiTheme' {
    interface Theme {
        isDark: boolean;
        bg: {
            level1: string;
            level2: string;
        };
    }
    interface ThemeOptions {
        isDark: boolean;
        bg: {
            level1: string;
            level2: string;
        };
    }
}

declare module 'styled-components' {
    export interface DefaultTheme extends Theme {}
}

import { CSSProp } from 'styled-components';

declare module 'react' {
    interface Attributes {
        /**
         * If present, this React element will be converted by
         * `babel-plugin-styled-components` into a styled component
         * with the given css as its styles.
         */
        css?: CSSProp<Theme>;
    }
}
