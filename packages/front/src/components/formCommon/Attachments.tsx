import React, { useEffect } from 'react';
import { Button, FormHelperText } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { fileExtension } from '../../utils/fileExtension';
import { nanoid } from 'nanoid/non-secure';
import { attachmentsCollectionName, occupationCollectionName } from '../../constants';
import { toast } from 'react-toastify';
import { AttachmentRepository } from '../../repository/AttachmentRepository';
import { AttachmentEntityType, IAttachment } from '../../../../../types/__project_defs/IAttachment';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { AttachmentItem } from './AttachmentItem';
import AttachmentStyles from './AttachmentStyles';
import { acceptMoreFiles } from '../../utils/acceptMoreFiles';
import router from 'next/router';

const { HiddenInput } = AttachmentStyles;

const pendingUploadAttachmentsMap = observable.map(new Map<string, IAttachment & { progress: number }>());

const AnexoInternalListView = observer((props: { anexos: IAttachment[] & { progress?: number }; edit?: boolean }) => {
    return (
        <>
            {props.anexos.map(anexo => {
                return <AttachmentItem key={anexo.machineName} attachment={anexo} />;
            })}
        </>
    );
});

export const Attachments = observer(
    (props: {
        entityType: AttachmentEntityType;
        entityId: string;
        helperText: string;
        value: IAttachment[];
        maxFiles: number;
        maxSizePerFile: number;
    }) => {
        useEffect(() => {
            const { entityType, entityId } = props;
            const unsubscribe = window.fireDB
                .collection(entityType)
                .doc(entityId)
                .onSnapshot(snapshot => {
                    if (!snapshot.exists) {
                        toast.error(
                            entityType === occupationCollectionName
                                ? 'A ocupação foi removida, portanto não é possível adicionar novos anexos'
                                : 'O filiado foi removido, portanto não é possível adicionar novos anexos'
                        );
                        router.push(entityType === occupationCollectionName ? '/ocupacoes' : '/filiados');
                    }
                });

            return () => {
                runInAction(() => {
                    pendingUploadAttachmentsMap.clear();
                });
                unsubscribe();
            };
        }, []);

        const handleOnChange = async (evt: React.ChangeEvent<HTMLInputElement>) => {
            if (evt.target.files == null) {
                return;
            }

            evt.persist();

            if (!acceptMoreFiles(props.value.length, evt.target.files.length, props.maxFiles)) {
                return;
            }

            for (let file of evt.target.files) {
                const size = file.size || 0;

                if (size === 0) {
                    toast.error(`Arquivo ${file.name} corrompido`);
                } else if (size <= props.maxSizePerFile) {
                    const date = new Date();
                    const machineName = nanoid() + `.${fileExtension(file.name)}`;
                    const attachment: IAttachment = {
                        name: file.name as string,
                        machineName,
                        path: file,
                        size: (file as File).size,
                        entityType: props.entityType,
                        entityId: props.entityId,
                        createdAt: date,
                        changedAt: date,
                    };

                    runInAction(() => {
                        pendingUploadAttachmentsMap.set(machineName, { ...attachment, progress: 0 });
                    });

                    uploadAttachment(attachment, props.entityType, props.entityId);
                } else {
                    toast.error('Arquivo grande demais, apenas arquivos com 50MB ou menos são aceitos');
                }
            }

            // resolve um bug(ou comportamento) do chrome, onde ao selecionar a mesma imagem, que foi previamente selecionada,
            // o envento onChange não é disparado no <input type="file">
            // https://stackoverflow.com/questions/12030686/html-input-file-selection-event-not-firing-upon-selecting-the-same-file/12102992
            // @ts-ignore
            evt.target.value = null;
        };

        const uploadAttachment = (attachment: IAttachment, entityType: AttachmentEntityType, entityId: string) => {
            const newPath = `${attachmentsCollectionName}/${entityType}/${entityId}/${attachment.machineName}`;

            // Register three observers:
            // 1. 'state_changed' observer, called any time the state changes
            // 2. Error observer, called on failure
            // 3. Completion observer, called on successful completion
            const uploadTask = window.fireStorage
                .ref()
                .child(newPath)
                .put(attachment.path as File);

            uploadTask.on(
                'state_changed',
                function (snapshot) {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    runInAction(() => {
                        pendingUploadAttachmentsMap.get(attachment.machineName)!.progress =
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    });

                    switch (snapshot.state) {
                        case window.firebase.storage.TaskState.PAUSED: // or 'paused'
                            break;
                        case window.firebase.storage.TaskState.RUNNING: // or 'running'
                            break;
                    }
                },
                function (error: any) {
                    // A full list of error codes is available at
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    switch (error.code) {
                        case 'storage/unauthorized':
                            toast.error('Erro de permissões ao salvar arquivo ' + attachment.name);
                            // User doesn't have permission to access the object
                            break;

                        case 'storage/canceled':
                            toast.error('Erro, envio cancelado ' + attachment.name);
                            // User canceled the upload
                            break;

                        case 'storage/unknown':
                            toast.error('Erro desconhecido no envio do arquivo ' + attachment.name);
                            // Unknown error occurred, inspect error.serverResponse
                            break;
                    }
                },
                async function () {
                    await AttachmentRepository.save({
                        ...attachment,
                        path: newPath,
                    });

                    runInAction(() => {
                        pendingUploadAttachmentsMap.delete(attachment.machineName);
                    });
                    toast.success(`Anexo salvo "${attachment.name}"`);
                }
            );
        };

        const disableAddMore = props.maxFiles === props.value.length;

        return (
            <div css='width: 100%'>
                <HiddenInput disabled={disableAddMore} id='contained-button-file' multiple type='file' onChange={handleOnChange} />
                <label htmlFor='contained-button-file'>
                    <Button
                        disabled={disableAddMore}
                        startIcon={<AddBoxIcon />}
                        variant='outlined'
                        component='span'
                        style={{ marginBottom: 16 }}
                    >
                        Adicionar Anexos
                    </Button>
                </label>

                {/* Already saved attachments */}
                <AnexoInternalListView anexos={props.value} />

                {/* Attachments that will are uploading */}
                <AnexoInternalListView anexos={Array.from(pendingUploadAttachmentsMap).map(([_, attachment]) => attachment)} />

                <FormHelperText>{props.helperText}</FormHelperText>
            </div>
        );
    }
);
