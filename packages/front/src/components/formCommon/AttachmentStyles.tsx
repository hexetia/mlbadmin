import styled from 'styled-components';
import { Paper, Typography } from '@material-ui/core';

const FilePaper = styled(Paper)`
    display: flex;
    align-items: center;
    padding: 8px;
`;

const Filename = styled(Typography)`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const HiddenInput = styled.input`
    display: none;
`;

export default { FilePaper, Filename, HiddenInput };
