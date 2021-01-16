import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { EditImageDialog, editImageStore, ImageEditorOptions } from '../EditImageDialog';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';

export const HookFormImageFieldWithOptionalEditor = observer(
    (props: {
        className?: string;
        editorOptions?: ImageEditorOptions;
        onChange: (...event: any[]) => void;
        onBlur: () => void;
        value: any;
        children: any;
        maxWidth?: number;
    }) => {
        const previewRef = useRef<string | null>(null);
        const htmlID = 'photo';

        useEffect(() => {
            const currentPreview = previewRef.current;
            return () => {
                if (typeof currentPreview === 'string') {
                    URL.revokeObjectURL(currentPreview);
                }
            };
        }, []);

        const handleFotoChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
            evt.persist();

            if (evt.target.files == null) {
                return;
            }

            if (typeof previewRef.current === 'string') {
                URL.revokeObjectURL(previewRef.current);
            }

            const file = evt.target.files[0];

            previewRef.current = URL.createObjectURL(file);

            if (props.editorOptions !== undefined) {
                runInAction(() => {
                    editImageStore.set({ preview: previewRef.current!, blob: file });
                });
            } else {
                props.onChange({ preview: previewRef.current, blob: file });
            }

            // resolve um bug(ou comportamento) do chrome, onde ao selecionar a imagem, que foi previamente selecionada,
            // o envento onChange não é disparado no <input type="file">
            // https://stackoverflow.com/questions/12030686/html-input-file-selection-event-not-firing-upon-selecting-the-same-file/12102992
            evt.target.value = null as any;
        }, []);

        return (
            <>
                {editImageStore.get() !== null && (
                    <EditImageDialog
                        editorOptions={props.editorOptions!}
                        onChange={props.onChange}
                        previewRef={previewRef}
                        maxWidth={props.maxWidth}
                    />
                )}

                <HiddenInput accept='image/*' data-testid='uploadPhoto' id={htmlID} name={htmlID} type='file' onChange={handleFotoChange} />

                <label
                    className={props.className}
                    htmlFor={htmlID}
                    tabIndex={0}
                    onKeyUp={event => {
                        if (event.nativeEvent.code === 'Enter') {
                            document.getElementById(htmlID)?.click();
                        }
                    }}
                >
                    {props.children}
                </label>
            </>
        );
    }
);

const HiddenInput = styled.input`
    display: none;
`;
