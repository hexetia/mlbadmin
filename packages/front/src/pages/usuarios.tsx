import React, { useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    Paper,
    Radio,
    RadioGroup,
    Typography,
    useMediaQuery,
} from '@material-ui/core';
import styled from 'styled-components';
import { SendInvitesSection } from '../components/users/SendInvitesSection';
import { InvitesList } from '../components/users/InvitesList';
import { LinearLoading } from '../components/LinearLoading';
import { ROLES } from '../enums/ROLES';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { UserListItem } from '../../../../types/__project_defs/UserListItem';
import { toast } from 'react-toastify';
import { confirmDialog } from '../components/ConfirmDialog';
import { usersCollectionName } from '../constants';
import { GuardPage } from '../security/GuardPage';
import Head from 'next/head';
import { useFirestoreQuery } from '../customHooks/useFirestoreQuery';

const userRoleMapper = (user?: UserListItem): string => {
    return user?.customClaims?.role || 'SEM Permissões';
};

const Users = () => {
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserListItem | undefined>();
    const [newPermission, setNewPermission] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const fullScreenDialog = useMediaQuery('(max-width: 700px)');
    const { data, status } = useFirestoreQuery(window.fireDB.collection(usersCollectionName));

    const handleClickEditUser = (user: UserListItem) => () => {
        unstable_batchedUpdates(() => {
            setSelectedUser(user);
            setOpen(true);
            setNewPermission(userRoleMapper(undefined) === userRoleMapper(user) ? '' : userRoleMapper(user));
        });
    };

    const saveUserPermissions = async () => {
        setIsSaving(true);

        try {
            await window.fireApp.functions().httpsCallable('changeRole')({ targetUID: selectedUser?.uid, targetRole: newPermission });
        } catch (e: unknown) {
        } finally {
            setIsSaving(false);
        }

        setOpen(false);
    };

    const cancelEditUser = async () => {
        setOpen(false);
    };

    const handleDeleteUser = (user: UserListItem) => async () => {
        setIsSaving(true);
        const confirmedDeletion = await confirmDialog({
            title: 'Deletar usuário?',
            helperText: (
                <>
                    O usuário <b>{user.email}</b> será deletado e não terá mais acesso ao sistema, você poderá convida-lo a caso deseje
                </>
            ),
            confirmButtonText: 'Deletar',
            negateButtonText: 'Cancelar',
            typedToConfirmAction: '',
            typeExactTextHelper: '',
        });

        if (!confirmedDeletion) {
            return;
        }

        try {
            await window.fireApp.functions().httpsCallable('deleteUser')({ email: user.email });
            toast.success('Usuário deletado');
        } catch (e: unknown) {
        } finally {
            setIsSaving(false);
        }
    };

    if (status === 'loading') {
        return <LinearLoading />;
    }

    if (status === 'error') {
        return <Typography>Erro ao carregar lista de usuários</Typography>;
    }

    return (
        <Container css='padding-top: 16px'>
            <Head>
                <title>Usuários do sistema</title>
            </Head>
            <Typography variant='h4' css='padding-bottom: 24px'>
                Usuários do sistema
            </Typography>
            <SendInvitesSection />

            {data.map(user => (
                <Row key={user.uid} square>
                    <RowData>
                        <div css='width: 60%;overflow-wrap: break-word;font-family: monospace;'>{user.email?.toUpperCase()}</div>
                        <Typography variant='caption' css='text-align: center'>
                            {userRoleMapper(user)}
                        </Typography>
                        <IconButton disabled={user.customClaims?.firstAdministrator} onClick={handleClickEditUser(user)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton disabled={user.customClaims?.firstAdministrator} onClick={handleDeleteUser(user)}>
                            <DeleteIcon />
                        </IconButton>
                    </RowData>
                </Row>
            ))}

            <Dialog fullScreen={fullScreenDialog} open={open} onClose={() => setOpen(false)} aria-labelledby='form-dialog-title'>
                <DialogTitle id='form-dialog-title'>PERMISSÕES DO USUÁRIO</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Personalize quais permissões <HighlightedMail>{selectedUser?.email?.toUpperCase()}</HighlightedMail> terá no
                        sistema.
                    </DialogContentText>

                    <FormControl component='fieldset'>
                        <RadioGroup
                            aria-label='permissions'
                            name='permissions'
                            value={newPermission}
                            onChange={e => setNewPermission(e.target.value)}
                        >
                            <FormControlLabel value={ROLES.ADMINISTRATOR} control={<Radio />} label='Administrador' />
                            <FormControlLabel value={ROLES.CONTENT_EDITOR} control={<Radio />} label='Cadastrador' />
                        </RadioGroup>
                    </FormControl>

                    {isSaving && <LinearLoading />}

                    <DialogActions css='padding-top: 16px'>
                        <Button disabled={isSaving} color='primary' variant='contained' onClick={saveUserPermissions}>
                            Salvar
                        </Button>
                        <Button disabled={isSaving} color='secondary' variant='outlined' autoFocus onClick={cancelEditUser}>
                            Cancelar
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

            <InvitesList />
        </Container>
    );
};

export default GuardPage(ROLES.ADMINISTRATOR, Users);

const Row = styled(Paper)`
    padding: 24px;
    border-bottom: 2px solid ${props => props.theme.palette.divider};

    &:hover {
        background-color: ${props => props.theme.bg.level2};
    }

    &:last-of-type {
        border-bottom: none;
    }
`;

const RowData = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const HighlightedMail = styled.b`
    color: ${props => props.theme.palette.text.primary};
`;
