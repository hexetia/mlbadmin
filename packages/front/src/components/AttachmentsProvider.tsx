import React from 'react';
import { useFirestoreQuery } from '../customHooks/useFirestoreQuery';
import { fireDB } from '../firebase/fireApp';
import { attachmentsCollectionName } from '../constants';
import { Attachments } from './formCommon/Attachments';
import { Typography } from '@material-ui/core';
import { AttachmentEntityType } from '../../../../types/__project_defs/IAttachment';
import { observer } from 'mobx-react-lite';

interface Props {
    entityType: AttachmentEntityType;
    entityId: string;
    maxFiles?: number;
    maxSizePerFile?: number;
}

export const AttachmentsProvider = observer((props: Props) => {
    console.log('props', props);

    const { data: savedAttachments, status, error } = useFirestoreQuery(
        fireDB.collection(attachmentsCollectionName).where('entityId', '==', props.entityId).orderBy('createdAt')
    );

    if (status === 'error') {
        return <Typography>Erro ao carregar anexos do filiado, código do erro: {error.message}</Typography>;
    }

    if (status !== 'success') {
        return null;
    }

    return (
        <Attachments
            entityType={props.entityType}
            entityId={props.entityId}
            helperText='Até 50 anexos, fotos ou vídeos pequenos'
            value={savedAttachments}
            maxFiles={50}
            maxSizePerFile={50000000}
        />
    );
});
