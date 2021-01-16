import React from 'react';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { observer } from 'mobx-react-lite';
import cepFillStore from '../stores/cepFillStore';
import LinearProgress from '@material-ui/core/LinearProgress';
import styled from 'styled-components';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction='up' ref={ref} {...props} />;
});

export default observer(() => {
    return (
        <div>
            <Dialog
                open={cepFillStore.get() === 'loading'}
                TransitionComponent={Transition}
                keepMounted
                aria-labelledby='alert-dialog-slide-title'
                aria-describedby='alert-dialog-slide-description'
            >
                <StyledTitle id='alert-dialog-slide-title'>Buscando o CEP</StyledTitle>
                <DialogContent>
                    <DialogContentText id='alert-dialog-slide-description' component='div'>
                        <LinearProgress variant='indeterminate' />
                        Carregando endereço com CEP
                        <ul>
                            <li>Estado</li>
                            <li>Cidade</li>
                            <li>Bairro</li>
                            <li>Rua</li>
                        </ul>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    );
});

const StyledTitle = styled(DialogTitle)`
    color: ${props => props.theme.palette.primary.main};
    text-align: center;
`;
