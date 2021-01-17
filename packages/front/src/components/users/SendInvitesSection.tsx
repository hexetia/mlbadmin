import React, { useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Controller, useForm } from 'react-hook-form';
import SendIcon from '@material-ui/icons/Send';
import { useId } from '../../customHooks/useId';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { InviteRepository } from '../../repository/InviteRepository';
import pMinDelay from 'p-min-delay';
import { authStore } from '../../stores/authStore';
import { ROLES } from '../../enums/ROLES';

const schema = yup.object().shape({
    email: yup
        .string()
        .required('Insira o email')
        .email('Email incorreto')
        .test(
            'already have two invites to that email today',
            'Já existem dois convites feitos hoje para esse email, aguarde até amanhã para convidar novamente',
            async value => (await new InviteRepository(window.fireDB).findByEmailAndDate(value!)).length < 2
        ),
});

type OnlyEmail = { email: string };

export const SendInvitesSection = () => {
    const id = useId();
    const invitesRepository = useMemo(() => new InviteRepository(window.fireDB), []);
    const [inviteOpen, setInviteOpen] = useState(false);
    const { handleSubmit, control, formState, errors } = useForm<OnlyEmail>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: OnlyEmail) => {
        await pMinDelay(
            invitesRepository.save({
                ...data,
                createdBy: { email: authStore.user!.email!, name: authStore.user!.displayName! },
                role: ROLES.CONTENT_EDITOR,
            }),
            2000
        );
        toast.success('Convite enviado');
        setInviteOpen(false);
    };

    return (
        <div css='margin-bottom: 24px'>
            <Button variant='outlined' color='primary' onClick={() => setInviteOpen(true)}>
                <AddIcon /> Convidar novo administrador
            </Button>

            <Dialog
                open={inviteOpen}
                onClose={() => {
                    if (!formState.isSubmitting) {
                        setInviteOpen(false);
                    }
                }}
                aria-labelledby={id}
            >
                <DialogTitle id={id}>Enviar Convite</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Por questões de segurança, após o envio do convite o usuário terá 48 horas para se cadastrar no sistema, caso não se
                        cadastre você precisará enviar um novo convite.
                    </DialogContentText>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Controller
                            as={TextField}
                            name='email'
                            type='email'
                            control={control}
                            defaultValue='isadora-isadora2011@hotmail.com'
                            fullWidth
                            label='Email'
                            autoFocus
                            error={Boolean(errors.email?.message)}
                            helperText={errors.email?.message}
                        />
                    </form>

                    {formState.isSubmitting && <LinearProgress variant='indeterminate' />}

                    <DialogActions css='padding-top: 16px'>
                        <Button disabled={formState.isSubmitting} color='primary' variant='contained' onClick={handleSubmit(onSubmit)}>
                            <SendIcon />
                            Enviar
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </div>
    );
};
