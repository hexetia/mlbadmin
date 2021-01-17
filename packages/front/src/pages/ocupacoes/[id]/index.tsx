import React, { useMemo, useState } from 'react';
import { Button, Typography } from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import { OccupationRepository } from '../../../repository/OccupationRepository';
import { useQuery } from 'react-query';
import { AffiliateFilters } from '../../../components/filters/AffiliatesFilters';
import { OcupacaoCoverPlaceholder } from '../../../components/occupationsComponents/OccupationForm';
import { observer } from 'mobx-react-lite';
import { ROLES } from '../../../enums/ROLES';
import { GuardPage } from '../../../security/GuardPage';
import { useClientRouter } from 'use-client-router';
import { OccupationAffiliates } from '../../../components/occupations/OccupationAffiliates';
import { Skeleton } from '@material-ui/lab';
import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { AttachmentsProvider } from '../../../components/AttachmentsProvider';
import { occupationCollectionName } from '../../../constants';
import { AttachmentEntityType } from '../../../../../../types/__project_defs/IAttachment';
import { FirebaseImage } from '../../../firebase/FirebaseImage';
import { AddressView } from '../../../components/AddressView';
import Head from 'next/head';

const Occupation = observer(function Occupation() {
    const router = useClientRouter();
    const { id } = router.query;
    const repository = useMemo<OccupationRepository>(() => new OccupationRepository(window.fireDB), []);

    const [showFilters, setShowFilters] = useState(false);

    const { data, status, error } = useQuery(`occupation_${id}`, async () => repository.findById(id as string), {
        refetchOnWindowFocus: false,
    });

    if (status === 'error') {
        return <h1>Erro: {(error as Error).message}</h1>;
    }

    if (status === 'loading') {
        return (
            <>
                <Skeleton variant='rect' width='100%' height={218} />
                <Skeleton variant='text' />
                <Skeleton variant='text' />
            </>
        );
    }

    return (
        <>
            <Head>
                <title>{data.name}</title>
            </Head>
            <div data-testid='occupationPage'>
                <FirebaseImage
                    src={data!.photo as string}
                    Component={OcupacaoCoverPlaceholder}
                    Fallback={() => <Skeleton variant='rect' width='100%' height={218} />}
                />
                <Typography variant='h3'>{data!.name}</Typography>
                <Typography variant='body1' color='textSecondary' css='margin-bottom: 32px;' children={data!.note} />

                <AddressView address={data!.address} />

                <Accordion TransitionProps={{ unmountOnExit: true }} css='margin-top: 16px; margin-bottom: 32px;'>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel1a-content' id='panel1a-header'>
                        <Typography variant='subtitle1'>Anexos</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <AttachmentsProvider entityType={occupationCollectionName as AttachmentEntityType} entityId={data!.id!} />
                    </AccordionDetails>
                </Accordion>

                <div css='display: flex; justify-content: space-between'>
                    <Typography variant='h5' gutterBottom color='textSecondary'>
                        Filiados ({data!.totalAffiliates})
                    </Typography>
                    <Button onClick={() => setShowFilters(!showFilters)} startIcon={<FilterListIcon />} variant='outlined'>
                        Filtros
                    </Button>
                </div>

                {showFilters && <AffiliateFilters />}

                <OccupationAffiliates occupationId={id as string} />
            </div>
        </>
    );
});

export default GuardPage(ROLES.CONTENT_EDITOR, Occupation);
