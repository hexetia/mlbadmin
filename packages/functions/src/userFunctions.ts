import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ROLES } from 'front/src/enums/ROLES';
import { APP_ADMIN_EMAILS } from './helpers/env';
import {
    deleteUserFromCollection,
    hasInvite,
    initAdminAccount,
    initContentEditorAccount,
    isAdmin,
    isInitialAppAdmin,
    syncUserCollection,
} from './helpers/userHelpers';

type UserRecord = admin.auth.UserRecord;

/**
 * Firebase don't have a way to apply constraints on user registration,
 * so every created account that don't have an invitation will be removed
 * just after the register (fortunately the frontend is capable to detect that)
 */
export const onCreateUser = functions
    .runWith({ memory: '128MB' })
    .auth.user()
    .onCreate(async user => {
        if (!user.emailVerified) {
            await admin.auth().deleteUser(user.uid);
            return;
        }

        // automagically recognize the first administrator
        // the first administrator don't need an invite
        // end function execution after apply the side effects of first administrator creation
        if (isInitialAppAdmin(user)) {
            await initAdminAccount(user);
        } else if (await hasInvite(user.email)) {
            await initContentEditorAccount(user);
        } else {
            await admin.auth().deleteUser(user.uid);
        }
    });

export const onDeleteUser = functions
    .runWith({ memory: '128MB' })
    .auth.user()
    .onDelete(async user => {
        await deleteUserFromCollection(user);
    });

export const _changeRole = async (data: { targetUID: string; targetRole: ROLES }, context) => {
    if (!(await isAdmin(context))) {
        return;
    }

    if (!Object.values(ROLES).includes(data.targetRole)) {
        throw new Error('Unrecognized role');
    }

    const targetUser = await admin.auth().getUser(data.targetUID!);
    const customClaims = targetUser.customClaims ?? {};

    await admin.auth().setCustomUserClaims(data.targetUID, { ...customClaims, role: data.targetRole });
    await syncUserCollection(targetUser, data.targetRole);
};

/**
 * Change user role on customClaims
 */
export const changeRole = functions.runWith({ memory: '128MB' }).https.onCall(_changeRole);

export async function _deleteUser(data: { email: string }, context) {
    if (!(await isAdmin(context))) {
        throw new Error('403 Forbidden');
    }

    if (APP_ADMIN_EMAILS.includes(data.email)) {
        throw new Error(`ADMIN user can't be deleted`);
    }

    const user: UserRecord = await admin.auth().getUserByEmail(data.email);
    await admin.auth().deleteUser(user.uid);
}
/**
 * Http function that allow administrators to delete users
 */
export const deleteUser = functions.runWith({ memory: '128MB' }).https.onCall(_deleteUser);
