import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { IAffiliate } from '../../../../../types/__project_defs/IAffiliate';
import { AffiliateRepository } from '../../repository/AffiliateRepository';
import { Button, Typography, Paper } from '@material-ui/core';
import styled from 'styled-components';
import { HookFormImageFieldWithOptionalEditor } from '../formCommon/integrations/HookFormImageFieldWithOptionalEditor';
import { AddressFields } from '../AddressFields';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import { CelularMask, CPFMask, DataNascimentoMask } from '../formCommon/Masks';
import { ReactHookFormAutocompleteOccupation } from '../formCommon/integrations/ReactHookFormAutocompleteOccupation';
import { ErrorMessage } from '@hookform/error-message';
import { EducationLevel } from '../../enums/EducationLevel';
import { HookFormMuiNativeSelect } from '../formCommon/integrations/HookFormMuiNativeSelect';
import { Genre } from '../../enums/Genre';
import { MaritalStatus } from '../../enums/MaritalStatus';
import { toast } from 'react-toastify';
import { confirmDialog } from '../ConfirmDialog';
import { formatSearchableDateObject } from '../../utils/dateUtils';
import { yupResolver } from '@hookform/resolvers/yup';
import { SaveEntityButton } from '../formCommon/SaveEntityButton';
import { TextFieldOffAutocomplete } from '../formCommon/fields/TextFieldOffAutocomplete';
import { ErrorMessageWrapperStyled } from '../formCommon/ErrorMessageWrapperStyled';
import router from 'next/router';
import { FirebaseImage } from '../../firebase/FirebaseImage';
import { IAffiliateEdit } from '../../../../../types/__project_defs/IAffiliateEdit';
import { affiliateFormSchema } from './affiliateFormSchema';
import { handleFocus } from '../formCommon/handleFocus';

export default function AffiliateForm({ affiliate = {} }: { affiliate?: Partial<IAffiliateEdit> }) {
    const processAffiliateBeforeEdit = (affiliate?: Partial<IAffiliateEdit>): Partial<IAffiliateEdit> | undefined => {
        if (affiliate?.id !== undefined) {
            affiliate.birthday = formatSearchableDateObject(affiliate.birthday);
        }

        return affiliate;
    };
    const affiliateRepo = useMemo<AffiliateRepository>(() => new AffiliateRepository(window.fireDB), []);

    const { handleSubmit, setValue, control, errors, formState, register } = useForm<Partial<IAffiliateEdit>>({
        mode: 'onTouched',
        resolver: yupResolver(affiliateFormSchema),
        defaultValues: {
            ...{
                note: '',
                photo: '',
                name: '',
                cpf: '',
                rg: '',
                nis: '',
                birthday: '',
                phoneNumber: '',
                address: {
                    street: '',
                    number: '',
                },
                useOccupationAddress: false,
            },
            ...processAffiliateBeforeEdit(affiliate),
        },
    });

    const onSubmit = async (data: IAffiliate) => {
        const affiliateSaved = await affiliateRepo.save(data);
        toast.success('Filiado salvo');
        router.push(`/filiados/${affiliateSaved.id!}`);
    };

    return (
        <div css={'padding-top: 16px'}>
            <div>
                {affiliate.id && <input name='id' type='hidden' ref={register} />}

                <Typography variant='h4' gutterBottom data-testid='formTitle'>
                    {affiliate.id ? 'Editar dados do Filiado' : 'Adicionar Filiado'}
                </Typography>

                <ErrorMessageWrapperStyled gutterBottom errors={errors} name='photo' variant='h1' />

                <div css='display: flex; justify-content: center'>
                    <Controller
                        name='photo'
                        onFocus={handleFocus('photo')}
                        defaultValue=''
                        control={control}
                        render={({ ref, ...props }) => (
                            <StyledImageField {...props} editorOptions={{ aspect: 'square' }} maxWidth={400}>
                                <StyledPaper elevation={6}>
                                    <FirebaseImage
                                        src={typeof props.value === 'string' ? props.value : props.value?.preview}
                                        Component={props => (
                                            <CoverPlaceholder id='cover' tabIndex={0} {...props}>
                                                <PhotoCameraIcon />
                                                <span color='inherit'>Foto</span>
                                            </CoverPlaceholder>
                                        )}
                                    />
                                </StyledPaper>
                            </StyledImageField>
                        )}
                    />
                </div>

                <Typography variant='h5'>1. Ocupação</Typography>
                <ReactHookFormAutocompleteOccupation name='occupation' control={control} />

                <Typography variant='h5' style={{ paddingTop: 16 }}>
                    2. Dados
                </Typography>
                <Controller
                    as={TextFieldOffAutocomplete}
                    control={control}
                    label='Nome completo'
                    name='name'
                    error={Boolean(errors?.name?.message)}
                    required
                    helperText={<ErrorMessage name='name' errors={errors} />}
                />

                <Controller
                    control={control}
                    name='birthday'
                    render={renderProps => (
                        <TextFieldOffAutocomplete
                            {...renderProps}
                            label='Data de nascimento'
                            defaultValue=''
                            InputProps={{
                                inputComponent: DataNascimentoMask,
                            }}
                            required
                            error={Boolean(errors?.birthday?.message)}
                            helperText={<ErrorMessage name={renderProps.name} errors={errors} />}
                        />
                    )}
                />

                <Controller
                    as={TextFieldOffAutocomplete}
                    control={control}
                    label='CPF'
                    name='cpf'
                    InputProps={{
                        inputComponent: CPFMask,
                    }}
                    required
                    error={errors.cpf != null}
                    helperText={<ErrorMessage name={'cpf'} errors={errors} />}
                />

                <Controller
                    as={TextFieldOffAutocomplete}
                    control={control}
                    label='Celular'
                    InputProps={{
                        inputComponent: CelularMask,
                    }}
                    name='phoneNumber'
                    defaultValue=''
                    helperText='ex: 81 9 9612-1212'
                />

                <HookFormMuiNativeSelect
                    defaultValue={EducationLevel.ENSINO_FUNDAMENTAL}
                    errors={errors}
                    control={control}
                    formState={formState}
                    label='EducationLevel'
                    margin='normal'
                    name='educationLevel'
                    required
                >
                    {Object.values(EducationLevel).map(value => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </HookFormMuiNativeSelect>

                <HookFormMuiNativeSelect
                    defaultValue={Genre.Feminino}
                    errors={errors}
                    control={control}
                    formState={formState}
                    label='Gênero'
                    margin='normal'
                    name='genre'
                    required
                >
                    {Object.values(Genre).map(value => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </HookFormMuiNativeSelect>

                <HookFormMuiNativeSelect
                    defaultValue={MaritalStatus.SOLTEIRA}
                    errors={errors}
                    control={control}
                    formState={formState}
                    label='Estado Civil'
                    margin='normal'
                    name='maritalStatus'
                    required
                >
                    {Object.values(MaritalStatus).map(value => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </HookFormMuiNativeSelect>

                <Controller as={TextFieldOffAutocomplete} control={control} label='RG' name='rg' />

                <Controller as={TextFieldOffAutocomplete} control={control} label='NIS' name='nis' />

                <Controller name='note' as={TextFieldOffAutocomplete} control={control} label='Observação' rows={4} multiline />

                <Typography variant='h5' gutterBottom style={{ paddingTop: 16 }}>
                    3. Endereço
                </Typography>

                <AddressFields
                    allowAutoFillAddress={true}
                    errors={errors}
                    formState={formState}
                    setFormValue={setValue}
                    control={control}
                />

                <div css='margin-top: 32px'>
                    <SaveEntityButton isSubmitting={formState.isSubmitting} onClick={handleSubmit(onSubmit)} />

                    {affiliate && (
                        <Button
                            css='margin-left: 64px'
                            data-testid='deleteAffiliateButton'
                            onClick={async () => {
                                const confirm = await confirmDialog({
                                    title: 'Tem absoluta certeza que quer deletar o filiado?',
                                    helperText: (
                                        <>
                                            <p>
                                                Esta ação não poderá ser desfeita. Isso vai deletar permanentemente o filiado{' '}
                                                <b>{affiliate?.name!}</b>
                                            </p>
                                        </>
                                    ),
                                    confirmButtonText: 'Eu entendo as consequências, deletar filiado',
                                    negateButtonText: '',
                                    typedToConfirmAction: affiliate?.name!,
                                    typeExactTextHelper: 'Para confirmar a ação digite o name do filiado.',
                                });

                                console.log('deveria deletar?', confirm);

                                if (confirm) {
                                    await affiliateRepo.delete(affiliate as IAffiliate);
                                    toast.success('Filiado deletado');
                                    router.push('/filiados');
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
}

const CoverPlaceholder = styled.div.withConfig<{ src?: string }>({
    shouldForwardProp: prop => prop !== 'src',
})`
    background-image: url('${props => props.src}');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 100%;
    color: ${props => props.theme.palette.text.primary};
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    font-size: 24px;
    text-transform: uppercase;

    & > svg {
        display: initial;
    }
`;

const StyledPaper = styled(Paper)`
    width: 200px;
    height: 200px;
    margin: 0 auto;
    background: crimson;
`;

const StyledImageField = styled(HookFormImageFieldWithOptionalEditor)`
    cursor: pointer;
    margin: 22px 0;
`;
