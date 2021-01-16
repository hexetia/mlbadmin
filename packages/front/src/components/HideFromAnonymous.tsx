import React from 'react';
import { observer } from 'mobx-react-lite';
import { hasRole } from '../stores/authStore';
import { ROLES } from '../enums/ROLES';

export const HideFromAnonymous: React.FC = observer(props => {
    if (!hasRole(ROLES.CONTENT_EDITOR)) {
        return null;
    }

    return <>{props.children}</>;
});
