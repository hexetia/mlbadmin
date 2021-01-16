import React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    Typography,
    useMediaQuery,
} from '@material-ui/core';
import type { Omit } from '@material-ui/types';
import { nanoid } from 'nanoid/non-secure';
import CloseIcon from '@material-ui/icons/Close';
import { makeAutoObservable, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';

const defaultDialogProps = {
    title: '',
    helperText: '' as React.ReactNode,
    confirmButtonText: '',
    negateButtonText: '',
    typedToConfirmAction: '',
    typeExactTextHelper: '',
};
type TypeDefaultDialogProps = typeof defaultDialogProps;
type TypeAwaitingResolveMethod = (value: boolean | PromiseLike<boolean>) => void;
type TypeConfirmOptionsParam = Omit<TypeDefaultDialogProps, 'show'>;

class DialogStoreClass {
    @observable
    awaitingResolveMethod: TypeAwaitingResolveMethod = () => {};

    @observable
    dialogProps: TypeDefaultDialogProps & { show: boolean; currentText: string } = { ...defaultDialogProps, show: false, currentText: '' };

    constructor() {
        makeAutoObservable(this);
    }

    async confirm(options: TypeConfirmOptionsParam) {
        window.location.hash = `#confirmDialog-${nanoid()}`;
        dialogStore.dialogProps = { ...options, show: true, currentText: '' };

        return new Promise<boolean>(resolve => {
            dialogStore.awaitingResolveMethod = resolve;
        });
    }

    async onConfirmCallback(isConfirmed: boolean) {
        // dialogStore.dialogProps = { ...defaultDialogProps, show: false, currentText: '' };
        dialogStore.dialogProps = { ...dialogStore.dialogProps, show: false };

        dialogStore.awaitingResolveMethod!(isConfirmed);
    }
}
const dialogStore = new DialogStoreClass();

export const confirmDialog = dialogStore.confirm;

export const ConfirmDialog = observer(() => {
    const matchMediaQuery = useMediaQuery('(min-width:700px)');
    const router = useRouter();

    // handle history side-effects like pressing android "back" button to close dialog
    React.useEffect(() => {
        const savedState = dialogStore.dialogProps.show;
        if (!savedState) {
            if (window.location.hash.includes('confirmDialog')) {
                router.back();
            }
        }

        const sendCancelOnUserPressBackHistory = () => {
            if (!window.location.hash.includes('confirmDialog')) {
                dialogStore.onConfirmCallback(false);
            }
        };

        window.addEventListener('hashchange', sendCancelOnUserPressBackHistory);
        return () => window.removeEventListener('hashchange', sendCancelOnUserPressBackHistory);
    }, [dialogStore.dialogProps.show]);

    return (
        <>
            <Dialog
                fullScreen={!matchMediaQuery}
                // open={dialogStore.dialogProps.show}
                open={window.location.hash.includes('confirmDialog') && dialogStore.dialogProps.show}
                onClose={() => dialogStore.onConfirmCallback(false)}
                aria-labelledby='confirm-dialog'
            >
                <DialogTitle id='confirm-dialog' css='margin: 0; padding: 16px; width: 90%'>
                    <Typography variant='h6' component='div'>
                        {dialogStore.dialogProps.title}
                        <IconButton
                            css='position: absolute; right: 8px; top: 8px;'
                            aria-label='close'
                            onClick={() => {
                                dialogStore.onConfirmCallback(false);
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    {dialogStore.dialogProps.helperText}
                    {dialogStore.dialogProps.typedToConfirmAction !== '' && (
                        <>
                            <Typography component='p' css='margin-top: 40px'>
                                {dialogStore.dialogProps.typeExactTextHelper}
                            </Typography>
                            <TextField
                                autoFocus
                                variant='outlined'
                                onChange={e => (dialogStore.dialogProps.currentText = e.target.value)}
                                value={dialogStore.dialogProps.currentText}
                                margin='dense'
                                inputProps={{ autoComplete: nanoid() }}
                                data-testid='confirmInput'
                                fullWidth
                            />
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        // css={`
                        //     color: ${dialogStore.dialogProps.negateButtonText === '' ? 'red' : 'initial'};
                        // `}
                        data-testid='confirmButton'
                        disabled={
                            dialogStore.dialogProps.currentText.toLowerCase() !== dialogStore.dialogProps.typedToConfirmAction.toLowerCase()
                        }
                        variant='outlined'
                        onClick={() => dialogStore.onConfirmCallback(true)}
                    >
                        {dialogStore.dialogProps.confirmButtonText}
                    </Button>

                    {dialogStore.dialogProps.negateButtonText !== '' && (
                        <Button variant='outlined' onClick={() => dialogStore.onConfirmCallback(false)}>
                            {dialogStore.dialogProps.negateButtonText}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
});
