import React from 'react';
import dynamic from 'next/dynamic';
import { hasRole } from '../../stores/authStore';
import { ROLES } from '../../enums/ROLES';
import { useClientRouter } from 'use-client-router';
import { observer } from 'mobx-react-lite';

const DynamicTabs = dynamic(() => import('../SharedViewAndEditTabs'), { ssr: false });

const OccupationTabsWidget = observer(() => {
    const clientRouter = useClientRouter();

    if (clientRouter.route.includes('/ocupacoes/[id]') && hasRole(ROLES.CONTENT_EDITOR)) {
        return <DynamicTabs routePrefix='/ocupacoes' params={clientRouter.query} />;
    } else {
        return null;
    }
});

export default OccupationTabsWidget;
