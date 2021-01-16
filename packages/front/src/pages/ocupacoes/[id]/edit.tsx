import { useMemo } from 'react';
import { ROLES } from '../../../enums/ROLES';
import { GuardPage } from '../../../security/GuardPage';
import { fireDB } from '../../../firebase/fireApp';
import { useClientRouter } from 'use-client-router';
import { IOccupation } from '../../../../../../types/__project_defs/IOccupation';
import { OccupationForm } from '../../../components/occupationsComponents/OccupationForm';
import { observer } from 'mobx-react-lite';
import { Typography } from '@material-ui/core';
import { AnimatedDot } from '../../../components/AnimatedDot';
import { OccupationRepository } from '../../../repository/OccupationRepository';
import { useQuery } from 'react-query';
import Head from 'next/head';

const EditOccupation = observer(function EditOccupation() {
    const clientRouter = useClientRouter();
    const repository = useMemo<OccupationRepository>(() => new OccupationRepository(fireDB), []);

    const { data, status } = useQuery<IOccupation>(
        ['edit_occupation', clientRouter.query.id],
        async ctx => await repository.findById(ctx.queryKey[1] as string)
    );

    if (status === 'loading') {
        return (
            <Typography variant='h5'>
                Carregando
                <AnimatedDot>.</AnimatedDot>
                <AnimatedDot>.</AnimatedDot>
                <AnimatedDot>.</AnimatedDot>
            </Typography>
        );
    }

    return (
        <>
            <Head>
                <title>{data.name}</title>
            </Head>
            <OccupationForm occupation={data} />
        </>
    );
});

export default GuardPage(ROLES.CONTENT_EDITOR, EditOccupation);
