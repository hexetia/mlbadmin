import React, { useMemo } from 'react';
import { invitesCollectionName } from '../../constants';
import { Invite } from '../../../../../types/__project_defs/Invite';
import { IconButton, Typography } from '@material-ui/core';
import { Paper } from '@material-ui/core';
import { FirebaseServerDate } from '../../../../../types/__project_defs/FirebaseServerDate';
import { format } from 'fecha';
import DeleteIcon from '@material-ui/icons/Delete';
import { InviteRepository } from '../../repository/InviteRepository';
import { useFirestoreQuery } from '../../customHooks/useFirestoreQuery';
import { LinearLoading } from '../LinearLoading';

export const InvitesList = () => {
    const { data, status } = useFirestoreQuery(window.fireDB.collection(invitesCollectionName).orderBy('createdAt', 'desc'));

    return (
        <div>
            <Typography variant='h4' css='padding: 24px 0'>
                Convites pendentes
            </Typography>

            {status === 'success' && data.length === 0 && (
                <Typography variant='subtitle1' color='textSecondary'>
                    Nenhum convite pendente
                </Typography>
            )}

            {!data && <LinearLoading />}

            {data && data.map(invite => <InviteView key={invite.id} invite={invite} />)}
        </div>
    );
};

const InviteView = ({ invite }: { invite: Invite }) => {
    const invitesRepository = useMemo(() => new InviteRepository(window.fireDB), []);

    return (
        <Paper
            variant='outlined'
            elevation={2}
            css='margin: 8px 0;display: flex; justify-content: space-between; align-items: center;
    '
        >
            <div css='padding: 16px'>
                <Typography variant='subtitle1' css='word-break: break-all'>
                    {invite.email.toUpperCase()}
                </Typography>
                <Typography variant='subtitle1'>
                    {format(new Date((((invite.createdAt as unknown) as FirebaseServerDate)?.seconds | 0) * 1000), 'DD/MM/YYYY')}
                </Typography>
            </div>

            <div>
                <IconButton title='Cancelar Convite' onClick={async () => invitesRepository.delete(invite)}>
                    <DeleteIcon />
                </IconButton>
            </div>
        </Paper>
    );
};
