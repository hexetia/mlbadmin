import React from 'react';
import dynamic from 'next/dynamic';
import { ROLES } from '../../enums/ROLES';
import { GuardPage } from '../../security/GuardPage';
import Head from 'next/head';

const AffiliateFormDynamic = dynamic(() => import('../../components/affiliatesComponents/AffiliateForm'), { ssr: false });

function AddAffiliate() {
    return (
        <>
            <Head>
                <title>Adicionar ocupação</title>
            </Head>
            <AffiliateFormDynamic />
        </>
    );
}

export default GuardPage(ROLES.CONTENT_EDITOR, AddAffiliate);
