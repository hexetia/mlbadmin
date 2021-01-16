import type { User } from '@firebase/auth-types';
import { authStatus, authStore, hasRole } from './authStore';
import { ROLES } from '../enums/ROLES';
import { AUTH_STATUS_ENUM } from '../enums/AUTH_STATUS_ENUM';

describe('test initial authStore status', () => {
    const initialStore = Object.freeze({
        user: undefined, // firebase auth resolve super fast the user state in tests, in browser the really initial state is undefined
        role: '',
    });

    it('init with unknow login state', () => {
        expect(authStore).toEqual(initialStore);
    });
});

describe('test auth state', () => {
    beforeEach(() => {
        authStore.user = undefined;
        authStore.role = '';
    });

    it('correct authStatus()', () => {
        expect(authStatus()).toBe(AUTH_STATUS_ENUM.UNKNOW);

        authStore.user = null;
        expect(authStatus()).toBe(AUTH_STATUS_ENUM.DISCONNECTED);

        authStore.user = {} as User;
        expect(authStatus()).toBe(AUTH_STATUS_ENUM.LOGGED);
    });

    it('test hasRole', () => {
        expect(hasRole(ROLES.ADMINISTRATOR)).toBe(false);
        expect(hasRole(ROLES.CONTENT_EDITOR)).toBe(false);

        expect(hasRole('something' as any)).toBe(false);

        authStore.role = ROLES.CONTENT_EDITOR;
        expect(hasRole(ROLES.CONTENT_EDITOR)).toBe(true);

        authStore.role = ROLES.ADMINISTRATOR;
        expect(hasRole(ROLES.ADMINISTRATOR)).toBe(true);
    });
});
