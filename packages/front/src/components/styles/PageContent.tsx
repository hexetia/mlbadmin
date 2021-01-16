import styled from 'styled-components';
import theme from 'theme.macro';

export const PageContent = styled.div`
    width: 100%;

    ${theme.breakpoints.up('md')} {
        margin: 16px auto 0;
        max-width: 1280px;
    }
`;
