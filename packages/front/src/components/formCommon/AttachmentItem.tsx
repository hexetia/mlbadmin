import { observer } from 'mobx-react-lite';
import { IAttachment } from '../../../../../types/__project_defs/IAttachment';
import React, { useState } from 'react';
import { Box, Button, IconButton } from '@material-ui/core';
import { defaultStyles, FileIcon } from 'react-file-icon';
import { fileExtension } from '../../utils/fileExtension';
import TextField from '@material-ui/core/TextField';
import pMinDelay from 'p-min-delay';
import { attachmentsCollectionName } from '../../constants';
import { basename } from '../../utils/fileUtils';
import EditIcon from '@material-ui/icons/Edit';
import { confirmDialog } from '../ConfirmDialog';
import { AttachmentRepository } from '../../repository/AttachmentRepository';
import DeleteIcon from '@material-ui/icons/Delete';
import LinearProgress from '@material-ui/core/LinearProgress';
import AttachmentStyles from './AttachmentStyles';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { imgStr } from '../../firebase/imgStr';

const { FilePaper, Filename } = AttachmentStyles;

const HrefAttachment = ({ href, children }: { href: string; children: React.ReactNode }) => {
    if (href === '') {
        return <>{children}</>;
    }

    return (
        <a target='_blank' href={href} title='Visualizar anexo' css='text-decoration: none'>
            {children}
        </a>
    );
};

export const AttachmentItem = observer((props: { attachment: IAttachment & { progress?: number } }) => {
    const [newName, setNewName] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<'ok' | 'error' | 'updating'>('ok');
    const isEditing = newName !== undefined;

    const hrefAttachment = typeof props.attachment.path === 'string' ? imgStr(props.attachment.path as string) : '';

    return (
        <HrefAttachment href={hrefAttachment}>
            <Box margin='8px 0'>
                <FilePaper variant='outlined'>
                    <Box maxWidth={32} marginRight={1}>
                        <FileIcon
                            extension={fileExtension(props.attachment.name)}
                            {...defaultStyles[fileExtension(props.attachment.name)]}
                        />
                    </Box>
                    <Box overflow='hidden' flexGrow='1'>
                        {isEditing ? (
                            <TextField
                                css='width: 95%'
                                autoFocus
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                onClick={e => e.preventDefault()}
                            />
                        ) : (
                            <Filename noWrap={false}>{props.attachment.name}</Filename>
                        )}
                    </Box>

                    {props.attachment.progress === undefined && (
                        <Box display='flex' marginLeft='auto'>
                            {isEditing && (
                                <Button
                                    disabled={status === 'updating'}
                                    color='primary'
                                    size='small'
                                    onClick={async e => {
                                        e.preventDefault();

                                        setStatus('updating');

                                        pMinDelay(
                                            window.fireDB
                                                .collection(attachmentsCollectionName)
                                                .doc(props.attachment.id!)
                                                .update('name', `${newName}.${fileExtension(props.attachment.name)}`),
                                            1000
                                        )
                                            .then(() => {
                                                setNewName(undefined);
                                                setStatus('ok');
                                            })
                                            .catch(() => setStatus('error'));
                                    }}
                                >
                                    Salvar alterações
                                </Button>
                            )}

                            {!isEditing && (
                                <>
                                    <IconButton
                                        aria-label='renomear-abrir-dialog pra inserir novo nome do arquivo'
                                        onClick={e => {
                                            e.preventDefault();
                                            setNewName(basename(props.attachment.name));
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>

                                    <IconButton
                                        data-testid={`deleteAttachment-${props.attachment.id!}`}
                                        onClick={async e => {
                                            e.preventDefault();
                                            const confirm = await confirmDialog({
                                                title: 'Deletar Anexo',
                                                helperText: (
                                                    <p>
                                                        Esta ação não poderá ser desfeita. Isso vai deletar permanentemente o anexo{' '}
                                                        <b>{props.attachment.name}</b>
                                                    </p>
                                                ),
                                                confirmButtonText: 'Deletar',
                                                negateButtonText: 'Cancelar',
                                                typedToConfirmAction: '',
                                                typeExactTextHelper: '',
                                            });

                                            if (confirm) {
                                                setStatus('updating');

                                                pMinDelay(AttachmentRepository.deleteById(props.attachment.id!), 1000)
                                                    .then(() => {
                                                        setStatus('ok');
                                                        toast('Anexo removido');
                                                    })
                                                    .catch(() => setStatus('error'));
                                            }
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    )}
                </FilePaper>

                {status === 'updating' && <FullWidthLinearProgress variant='indeterminate' />}
                {props.attachment.progress !== undefined && (
                    <FullWidthLinearProgress variant='determinate' value={props.attachment.progress} />
                )}
            </Box>
        </HrefAttachment>
    );
});

const FullWidthLinearProgress = styled(LinearProgress)`
    width: 100%;
`;
