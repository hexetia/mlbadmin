import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import Dialog from '@material-ui/core/Dialog';
import type { TransitionProps } from '@material-ui/core/transitions';
import Slide from '@material-ui/core/Slide';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import type { UnprocessedImage } from '../../../../../types/__project_defs/UnprocessedImage';
import { observable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';

export const editImageStore = observable.box<UnprocessedImage | null>(null, { proxy: true, deep: false, autoBind: false });

interface CroppedArea {
    width: number;
    height: number;
    x: number;
    y: number;
}

export interface ImageEditorOptions {
    aspect: 'square' | 'wide';
}

export const EditImageDialog = observer(
    (props: { onChange: any; previewRef: React.MutableRefObject<string | null>; editorOptions: ImageEditorOptions; maxWidth?: number }) => {
        const [crop, setCrop] = useState({ x: 0, y: 0 });
        const [rotation, setRotation] = useState(0);
        const [zoom, setZoom] = useState(1);
        const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | undefined>();

        const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
            setCroppedAreaPixels(croppedAreaPixels);
        }, []);

        const closeEditor = useCallback(() => {
            runInAction(() => {
                editImageStore.set(null);
            });
        }, []);

        return (
            <Dialog fullScreen open={true} TransitionComponent={Transition}>
                <AppBar position='relative'>
                    <Toolbar>
                        <Typography variant='h5' color='inherit' children='Cortar foto' />
                    </Toolbar>
                </AppBar>
                <CropContainer>
                    <Cropper
                        image={editImageStore.get()!.preview}
                        crop={crop}
                        rotation={rotation}
                        zoom={zoom}
                        aspect={props.editorOptions.aspect === 'wide' ? 10 / 3 : 1}
                        onCropChange={setCrop}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </CropContainer>
                <Controls>
                    <SliderContainer>
                        <StyledSliderLabel variant='overline'>Zoom</StyledSliderLabel>
                        <StyledSlider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby='Zoom'
                            onChange={(e, zoom: number | number[]) => setZoom(zoom as number)}
                        />
                    </SliderContainer>
                    <SliderContainer>
                        <StyledSliderLabel variant='overline'>Rotation</StyledSliderLabel>
                        <StyledSlider
                            value={rotation}
                            min={0}
                            max={360}
                            step={0.3}
                            aria-labelledby='Rotation'
                            onChange={(e, rotation: any) => setRotation(rotation)}
                        />
                    </SliderContainer>

                    <ButtonsWrapper>
                        <Button onClick={closeEditor} fullWidth variant='outlined' color='secondary'>
                            Cancelar
                        </Button>

                        <form
                            data-lpignore={true}
                            onSubmit={async event => {
                                event.preventDefault();
                                closeEditor();

                                const croppedImage: UnprocessedImage = await getCroppedImg(
                                    props.previewRef.current!,
                                    croppedAreaPixels!,
                                    rotation,
                                    props.maxWidth
                                );

                                // prevent memory leak
                                URL.revokeObjectURL(props.previewRef!.current!);
                                props.previewRef!.current = croppedImage.preview;

                                props.onChange(croppedImage);
                            }}
                        >
                            <Button
                                autoFocus
                                fullWidth
                                type='submit'
                                variant='contained'
                                color='primary'
                                data-lpignore={true}
                                data-testid='cropPhotoButton'
                            >
                                CORTAR
                            </Button>
                        </form>
                    </ButtonsWrapper>
                </Controls>
            </Dialog>
        );
    }
);

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction='up' ref={ref} {...props} />;
});

const ButtonsWrapper = styled.div`
    display: flex;
    flex-direction: column;

    & > button {
        margin: 16px 0;
    }

    ${props => props.theme.breakpoints.up('sm')} {
        justify-content: flex-end;
        flex-direction: row;
        align-items: center;
        margin: 0 16px;

        & > *:nth-child(1) {
            width: fit-content;
            margin-right: 32px;
        }

        & > *:nth-child(2) {
            width: 100%;
            max-width: 300px;
        }
    }
`;

const CropContainer = styled.div`
    width: 100%;
    height: 200px;
    position: relative;
    background: #333;

    ${props => props.theme.breakpoints.up('sm')} {
        height: 400px;
    }
`;

const SliderContainer = styled.div`
    display: flex;
    flex: 1;
    align-items: center;
`;

const StyledSlider = styled(Slider)`
    padding: 22px 0;
    margin-left: 16px;

    ${props => props.theme.breakpoints.up('sm')} {
        flex-direction: row;
        align-items: center;
        margin: 0 16px;
    }
`;

const StyledSliderLabel = styled(Typography)`
    ${props => props.theme.breakpoints.down('xs')} {
        min-width: 65px;
    }
`;

const Controls = styled.div`
    display: flex;
    padding: 16px;
    align-items: stretch;
    flex-direction: column;

    ${props => props.theme.breakpoints.up('sm')}
`;
