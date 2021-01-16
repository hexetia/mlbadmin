import * as admin from 'firebase-admin';
import { APP_ADMIN_EMAILS } from './env';
import { ROLES } from 'front/src/enums/ROLES';
import { invitesCollectionName, usersCollectionName } from 'front/src/constants';
import { Invite } from '../../../../types/__project_defs/Invite';
import { twoDaysAgoFactory } from './functionsDateUtils';
import { CallableContext } from 'firebase-functions/lib/providers/https';

export function isInitialAppAdmin(user: admin.auth.UserRecord): boolean {
    return user.emailVerified && APP_ADMIN_EMAILS.includes(user.email);
}

export async function initAdminAccount(user: admin.auth.UserRecord) {
    await admin.auth().setCustomUserClaims(user.uid, { role: ROLES.ADMINISTRATOR });
    await syncUserCollection(user, ROLES.ADMINISTRATOR);
}

export async function initContentEditorAccount(user: admin.auth.UserRecord) {
    const allInvitesQuery = await admin.firestore().collection(invitesCollectionName).where('email', '==', user.email).get();

    console.log('initContentEditorAccount, user.email', user.email);

    for (const doc of allInvitesQuery.docs) {
        await admin.firestore().collection(invitesCollectionName).doc(doc.id).delete();
    }
    await admin.auth().setCustomUserClaims(user.uid, { role: ROLES.CONTENT_EDITOR });
    await syncUserCollection(user, ROLES.CONTENT_EDITOR);
}

/**
 * Invites is older than two days is considered expired
 */
export async function hasInvite(email: string): Promise<boolean> {
    const inviteQuery = await admin
        .firestore()
        .collection(invitesCollectionName)
        .where('email', '==', email)
        .where('createdAt' as keyof Invite, '>=', twoDaysAgoFactory())
        .get();

    return !inviteQuery.empty;
}

/**
 * Store the user in database after user creation
 *
 * @param user
 * @param targetRole after user creation the current user param don't have yet the role set in customClaims
 */
export async function syncUserCollection(user: admin.auth.UserRecord, targetRole: ROLES) {
    if (!user.emailVerified) {
        throw new Error('user email cannot be saved in collection because the email is not verified yet');
    }

    const userProps = userPublicProperties(user);

    await admin
        .firestore()
        .collection(usersCollectionName)
        .doc(user.uid)
        .set({ ...userProps, customClaims: { role: targetRole, firstAdministrator: APP_ADMIN_EMAILS.includes(userProps.email) } });
}

export async function deleteUserFromCollection(user: admin.auth.UserRecord) {
    if (!user.emailVerified) {
        throw new Error('user email cannot be deleted from collection because the email is not verified yet');
    }

    await admin.firestore().collection(usersCollectionName).doc(user.uid).delete();
}

export function userPublicProperties(user: admin.auth.UserRecord) {
    return { email: user.email, uid: user.uid, customClaims: user.customClaims, photoURL: user.photoURL };
}

export async function isAdmin(context: CallableContext): Promise<boolean> {
    if (!context.auth) {
        return false;
    }

    if (context.auth.token.email_verified) {
        if (context.auth.token?.role === ROLES.ADMINISTRATOR) {
            return true;
        }
    }

    return false;
}
