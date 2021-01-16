import { observable, runInAction } from 'mobx';
import { ROLES } from '../enums/ROLES';
import { AUTH_STATUS_ENUM } from '../enums/AUTH_STATUS_ENUM';
import type { User } from '@firebase/auth-types';

/** user === undefined -> AUTH_STATUS_ENUM.UNKNOW
 * user === null -> AUTH_STATUS_ENUM.DISCONNECTED
 * user === firebase.User -> AUTH_STATUS_ENUM.LOGGED
 */
export const authStore = observable({
    user: undefined as undefined | null | User,
    role: '',
});

/**
 * When some code call resetAuthStore the auth state is not more unknow
 * then, whe should modify authStore.user property to null
 * showing to the rest of code that the status is just logged off
 */
export function resetAuthStore() {
    runInAction(() => {
        // must be null, because t
        authStore.user = null;
        authStore.role = '';
    });
}

export function authStatus(): AUTH_STATUS_ENUM {
    if (authStore.user === undefined) {
        return AUTH_STATUS_ENUM.UNKNOW;
    } else if (authStore.user === null) {
        return AUTH_STATUS_ENUM.DISCONNECTED;
    } else {
        return AUTH_STATUS_ENUM.LOGGED;
    }
}

export function hasRole(role: ROLES | ROLES[]): boolean {
    const isAdmin = authStore.role === ROLES.ADMINISTRATOR;

    if (isAdmin) {
        return true;
    }

    const userRole = authStore.role;

    if (Array.isArray(role)) {
        return role.some(roleItem => roleItem.toString() === userRole);
    } else {
        return role.toString() === userRole;
    }
}
