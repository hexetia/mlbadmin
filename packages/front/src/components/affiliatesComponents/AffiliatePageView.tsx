import { IAffiliate } from '../../../../../types/__project_defs/IAffiliate';
import { FirebaseImage } from '../../firebase/FirebaseImage';
import { Skeleton } from '@material-ui/lab';
import Typography from '@material-ui/core/Typography';
import { notEmptyStr } from '../../utils/StringUtils';
import { formatSearchableDateObject } from '../../utils/dateUtils';
import { Accordion, AccordionDetails, AccordionSummary, Theme, useMediaQuery } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { AttachmentsProvider } from '../AttachmentsProvider';
import { affiliatesCollectionName } from '../../constants';
import { AttachmentEntityType } from '../../../../../types/__project_defs/IAttachment';
import { capitalize } from '@brazilian-utils/brazilian-utils';
import { AddressView } from '../AddressView';
import { AppLink } from '../AppLink';
import { AffFirstBlockDesk, AffPhoto, AffLabel, AffTextBlock, AffPhone } from './AffiliatePageStyles';
import { useMemo } from 'react';
import { OccupationRepository } from '../../repository/OccupationRepository';
import { fireDB } from '../../firebase/fireApp';
import { useQuery } from 'react-query';
import { IOccupation } from '../../../../../types/__project_defs/IOccupation';
import Head from 'next/head';
import omit from 'object.omit';

export const AffiliatePageView = (props: { affiliate: IAffiliate }) => {
    const occupationRepository = useMemo(() => new OccupationRepository(fireDB), []);
    const { data: occupation } = useQuery<IOccupation>(
        `occupation_${props.affiliate.occupationId}`,
        () => occupationRepository.findById(props.affiliate.occupationId),
        {
            staleTime: 3600_000,
            cacheTime: 3600_000,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            enabled: props.affiliate.occupationId !== '',
        }
    );

    const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

    return (
        <>
            <Head>
                <title>{props.affiliate.name}</title>
            </Head>
            {mdUp ? (
                <AffFirstBlockDesk>
                    <FirebaseImage
                        src={props.affiliate.photo as string}
                        Component={props => <AffPhoto {...props} />}
                        Fallback={() => <Skeleton variant='rect' />}
                    />

                    <AffiliateMainData affiliate={props.affiliate} occupation={occupation} />
                </AffFirstBlockDesk>
            ) : (
                <>
                    <FirebaseImage
                        src={props.affiliate.photo as string}
                        Component={props => <AffPhoto {...props} />}
                        Fallback={() => <Skeleton variant='rect' />}
                    />

                    <AffTextBlock>
                        <AffiliateMainData affiliate={props.affiliate} occupation={occupation} />
                    </AffTextBlock>
                </>
            )}

            <Accordion TransitionProps={{ unmountOnExit: true }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
                    <Typography variant='subtitle1'>Anexos</Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <AttachmentsProvider entityType={affiliatesCollectionName as AttachmentEntityType} entityId={props.affiliate.id} />
                </AccordionDetails>
            </Accordion>

            {notEmptyStr(props.affiliate.note) && (
                <AffTextBlock>
                    <Typography variant='subtitle1'>Observação</Typography>
                    <Typography variant='body1'>{props.affiliate.note}</Typography>
                </AffTextBlock>
            )}

            {notEmptyStr(props.affiliate.genre) && (
                <AffTextBlock>
                    <Typography variant='subtitle1'>Outras informações</Typography>

                    {notEmptyStr(props.affiliate.nis) && (
                        <Typography style={{ fontWeight: 300 }} variant='subtitle1'>
                            <AffLabel>NIS: </AffLabel>
                            {props.affiliate.nis}
                        </Typography>
                    )}

                    <Typography style={{ fontWeight: 300 }} variant='subtitle1'>
                        <AffLabel>Estado Civil: </AffLabel>
                        {capitalize(props.affiliate.maritalStatus!)}
                    </Typography>

                    <Typography style={{ fontWeight: 300 }} variant='subtitle1'>
                        <AffLabel>Gênero: </AffLabel>
                        {capitalize(props.affiliate.genre)}
                    </Typography>
                </AffTextBlock>
            )}

            <AddressView
                address={
                    props.affiliate?.useOccupationAddress
                        ? { ...props.affiliate.address, ...omit(occupation?.address || {}, ['number', 'complement'] as any) }
                        : props.affiliate.address
                }
            />
        </>
    );
};

const AffiliateMainData = (props: { affiliate: IAffiliate; occupation?: IOccupation }) => (
    <div>
        <Typography variant='h4'>{props.affiliate.name}</Typography>
        {notEmptyStr(props.affiliate.phoneNumber) && (
            <AffPhone as='a' href={`tel:${props.affiliate.phoneNumber}`}>
                {props.affiliate.phoneNumber}
            </AffPhone>
        )}

        <Typography style={{ fontWeight: 300 }} variant='subtitle1'>
            <AffLabel>CPF: </AffLabel>
            {props.affiliate.cpf}
        </Typography>
        {notEmptyStr(props.affiliate.rg) && (
            <Typography style={{ fontWeight: 300 }} variant='subtitle1'>
                <AffLabel>RG: </AffLabel>
                {props.affiliate.rg}
            </Typography>
        )}
        <Typography style={{ fontWeight: 300 }} variant='subtitle1'>
            <AffLabel>Data Nascimento: </AffLabel>
            {formatSearchableDateObject(props.affiliate.birthday)}
        </Typography>
        <Typography style={{ fontWeight: 300 }} variant='subtitle1'>
            <AffLabel>Escolaridade: </AffLabel>
            {props.affiliate.educationLevel}
        </Typography>
        {notEmptyStr(props.affiliate.occupationId) && (
            <Typography style={{ fontWeight: 300 }} variant='subtitle1'>
                <AffLabel>Ocupação: </AffLabel>
                <AppLink href={`/ocupacoes/${props.occupation?.id}`} css='color: blue'>
                    {props.occupation?.name}
                </AppLink>
            </Typography>
        )}
    </div>
);
