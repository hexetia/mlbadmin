import React from 'react';
import { useFirestoreQuery } from '../../../customHooks/useFirestoreQuery';
import { fireDB } from '../../../firebase/fireApp';
import { affiliatesCollectionName } from '../../../constants';
import { GuardPage } from '../../../security/GuardPage';
import { ROLES } from '../../../enums/ROLES';
import { useClientRouter } from 'use-client-router';
import { Skeleton } from '@material-ui/lab';
import { AffiliatePageView } from '../../../components/affiliatesComponents/AffiliatePageView';
import { PageContent } from '../../../components/styles/PageContent';

function Affiliate() {
    const clientRouter = useClientRouter();

    const { data, status, error } = useFirestoreQuery(fireDB.collection(affiliatesCollectionName).doc(clientRouter.query.id as string));

    if (status === 'loading') {
        return <Skeleton variant='rect' height='50%' />;
    }

    if (status === 'success' && !data) {
        return <h1>Filiado não encontrado, pode ter sido deletado antes de você acessar essa página.</h1>;
    }

    return (
        <PageContent data-testid='affiliatePage'>
            <AffiliatePageView affiliate={data!} />
        </PageContent>
    );
}

export default GuardPage(ROLES.CONTENT_EDITOR, Affiliate);
