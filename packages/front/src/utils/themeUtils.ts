import facePaint from 'facepaint';
import { appTheme } from '../stores/themeStore';

const theme = appTheme.get();

export const mq = facePaint([
    theme.breakpoints.up('sm'),
    theme.breakpoints.up('md'),
    theme.breakpoints.up('lg'),
    theme.breakpoints.up('xl'),
]);
