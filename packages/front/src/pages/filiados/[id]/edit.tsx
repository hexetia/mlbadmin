import { useQuery } from 'react-query';
import { AffiliateRepository } from '../../../repository/AffiliateRepository';
import React, { useMemo } from 'react';
import AffiliateForm from '../../../components/affiliatesComponents/AffiliateForm';
import { ROLES } from '../../../enums/ROLES';
import { GuardPage } from '../../../security/GuardPage';
import { useClientRouter } from 'use-client-router';
import { OccupationRepository } from '../../../repository/OccupationRepository';
import Head from 'next/head';

function AffiliateEdit() {
    const clientRouter = useClientRouter();
    const affiliateRepo = useMemo<AffiliateRepository>(() => new AffiliateRepository(window.fireDB), []);
    const occupationRepository = useMemo(() => new OccupationRepository(window.fireDB), []);

    const { data, status } = useQuery(
        ['affiliate_form', clientRouter.query.id],
        async ctx => {
            return await affiliateRepo.findById(ctx.queryKey[1]);
        },
        { cacheTime: 0 }
    );

    const { data: occupationData, isIdle } = useQuery(
        ['affiliate_form_ccupation', data?.occupationId],
        async ctx => {
            return await occupationRepository.findById(ctx.queryKey[1]);
        },
        {
            cacheTime: 0,
            enabled: data?.occupationId !== '',
        }
    );

    if (status === 'success' && !data) {
        return <h1>Filiado não encontrado, pode ter sido deletado antes de você acessar essa página.</h1>;
    }

    if (!data || (data?.occupationId !== '' && !occupationData)) {
        return null;
    }

    const aggregated = { ...data, occupation: occupationData };

    return (
        <>
            <Head>
                <title>{data.name}</title>
            </Head>
            <AffiliateForm affiliate={aggregated} />
        </>
    );
}

export default GuardPage(ROLES.CONTENT_EDITOR, AffiliateEdit);
