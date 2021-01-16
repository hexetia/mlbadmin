import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import { Button, Paper, TextField, Typography } from '@material-ui/core';
import { Controller, useForm } from 'react-hook-form';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import { HookFormImageFieldWithOptionalEditor } from '../formCommon/integrations/HookFormImageFieldWithOptionalEditor';
import { IOccupation } from '../../../../../types/__project_defs/IOccupation';
import { AddressFields } from '../AddressFields';
import { ErrorMessage } from '@hookform/error-message';
import { OccupationRepository } from '../../repository/OccupationRepository';
import { useId } from '../../customHooks/useId';
import { confirmDialog } from '../ConfirmDialog';
import { toast } from 'react-toastify';
import { observer } from 'mobx-react-lite';
import pMinDelay from 'p-min-delay';
import { mq } from '../../utils/themeUtils';
import { SaveEntityButton } from '../formCommon/SaveEntityButton';
import { ErrorMessageWrapperStyled } from '../formCommon/ErrorMessageWrapperStyled';
import router from 'next/router';
import { fireDB } from '../../firebase/fireApp';
import { FirebaseImage } from '../../firebase/FirebaseImage';
import { occupationSchema } from './occupationSchema';
import { yupResolver } from '@hookform/resolvers/yup';
import theme from 'theme.macro';
import { handleFocus } from '../formCommon/handleFocus';
import { useQueryClient } from 'react-query';

export const OccupationForm = observer(({ occupation = {} }: { occupation: Partial<IOccupation> }) => {
    const nomeFieldID = useId();
    const repository = useMemo<OccupationRepository>(() => new OccupationRepository(fireDB), []);
    const queryClient = useQueryClient();

    const { register, handleSubmit, setValue, control, formState, errors } = useForm<Partial<IOccupation>>({
        resolver: yupResolver(occupationSchema),
        mode: 'onTouched',
        defaultValues: {
            ...occupation,
        },
    });

    const onSubmit = async (data: IOccupation) => {
        const occupation = await pMinDelay(repository.save(data), 2000);
        await queryClient.invalidateQueries(`occupation_${occupation.id}`);
        await router.push(`/ocupacoes/${occupation.id}`);
        toast.success('Ocupação salva com sucesso.');
    };

    return (
        <div style={{ paddingTop: 16, paddingBottom: 120 }}>
            <Typography variant='h4' gutterBottom>
                {!occupation.id ? 'Adicionar Ocupação' : 'Editar dados da Ocupação'}
            </Typography>

            <ErrorMessageWrapperStyled gutterBottom errors={errors} name='photo' variant='h1' />

            <div>
                {occupation.id && <input name='id' type='hidden' ref={register} />}

                <Controller
                    name='photo'
                    onFocus={handleFocus('photo')}
                    defaultValue=''
                    control={control}
                    render={({ ref, ...props }) => {
                        return (
                            <StyledImageField {...props} editorOptions={{ aspect: 'wide' }} maxWidth={800}>
                                <StyledPaper elevation={6}>
                                    <FirebaseImage
                                        src={typeof props.value === 'string' ? props.value : props.value?.preview}
                                        Component={props => (
                                            <OcupacaoCoverPlaceholder {...props} id='cover' outline tabIndex={0}>
                                                <StyledPhotoCameraIcon color='inherit' />
                                                <Typography component='span'>Capa da Ocupação</Typography>
                                            </OcupacaoCoverPlaceholder>
                                        )}
                                    />
                                </StyledPaper>
                            </StyledImageField>
                        );
                    }}
                />

                <Typography variant='h5'>1. Dados</Typography>

                <Controller
                    as={TextField}
                    onFocus={handleFocus('name')}
                    control={control}
                    label='Nome da ocupação'
                    margin='normal'
                    fullWidth
                    name='name'
                    required
                    variant='outlined'
                    error={Boolean(errors.name?.message)}
                    helperText={<ErrorMessage errors={errors} name='name' />}
                    autoComplete={nomeFieldID}
                    inputProps={{ 'data-lpignore': true }}
                    defaultValue=''
                />

                <Controller
                    name='note'
                    defaultValue=''
                    as={TextField}
                    control={control}
                    label='Observação'
                    rows={4}
                    variant='outlined'
                    fullWidth
                    margin='normal'
                    multiline
                />

                <Typography variant='h5' gutterBottom>
                    2. Endereço
                </Typography>

                <AddressFields formState={formState} errors={errors} setFormValue={setValue} control={control} stateRequired cityRequired />

                <div css='margin-top: 32px'>
                    <SaveEntityButton isSubmitting={formState.isSubmitting} onClick={handleSubmit(onSubmit)} />

                    {occupation && (
                        <Button
                            data-testid='deleteOccupationButton'
                            css='margin-left: 64px'
                            disabled={formState.isSubmitting}
                            onClick={async () => {
                                const confirm = await confirmDialog({
                                    title: 'Tem absoluta certeza que quer deletar a ocuapação?',
                                    helperText: (
                                        <>
                                            <p>
                                                Deletar permanentemente a ocuapação <b>{occupation?.name!}</b> e todos os seus Anexos
                                            </p>
                                            {occupation?.totalAffiliates !== undefined && occupation?.totalAffiliates > 0 && (
                                                <p>
                                                    Todos os {occupation?.totalAffiliates!} filiados associados a essa ocuapção ficarão sem
                                                    ocuapação selecionada.
                                                </p>
                                            )}
                                        </>
                                    ),
                                    confirmButtonText: 'Eu entendo as consequências, deletar ocupação',
                                    negateButtonText: '',
                                    typedToConfirmAction: occupation?.name!,
                                    typeExactTextHelper: 'Para confirmar a ação digite o name da ocupação.',
                                });

                                if (confirm) {
                                    await repository.delete(occupation as IOccupation);
                                    toast.success('Ocupação deletada');
                                    router.push('/ocupacoes');
                                }
                            }}
                        >
                            Deletar
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
});

const StyledPaper = styled(Paper)`
    background-color: crimson;
    margin-bottom: 16px;
`;

const StyledPhotoCameraIcon = styled(PhotoCameraIcon)`
    color: ${props => props.theme.palette.text.primary};
`;

const smallerMuiContainerMargin = 32;
const smUpMuiContainerMargin = 48;

export const OcupacaoCoverPlaceholder = styled.div.withConfig<{ src?: string; outline?: boolean }>({
    shouldForwardProp: prop => prop !== 'src' && prop !== 'outline',
})`
    background-image: url('${props => props.src}');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    width: 100%;
    color: ${theme.palette.text.primary};
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    text-transform: uppercase;

    ${props =>
        props.outline &&
        css`
            &:focus,
            &:hover {
                outline: ${theme.isDark ? 'white' : 'black'} auto 1px;
            }
        `}

    & > svg {
        display: initial;
    }
    font-size: 40px;

    ${mq({
        height: [
            `calc((3 / 10) * (100vw - ${smallerMuiContainerMargin}px))`,
            `calc((3 / 10) * (100vw - ${smUpMuiContainerMargin}px))`,
            null,
            370,
        ],
    })}

    & > svg {
        font-size: 40px;
    }
`;

const StyledImageField = styled(HookFormImageFieldWithOptionalEditor)`
    cursor: pointer;
    width: 100%;
`;
