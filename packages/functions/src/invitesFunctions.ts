import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { invitesCollectionName } from 'front/src/constants';
import { Invite } from '../../../types/__project_defs/Invite';
import { threeDaysAgoFactory } from './helpers/functionsDateUtils';
import SesConstructor from 'aws-sdk/clients/ses';
import { invitesEmailTemplate } from './helpers/invitesEmailTemplate';
import { AWS_SES_ACCESS_KEY, AWS_SES_SECRET_ACCESS_KEY, APP_MAIL_SOURCE } from './helpers/env';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

const ses = new SesConstructor({
    region: 'us-west-2',
    apiVersion: '2010-12-01',
    accessKeyId: AWS_SES_ACCESS_KEY,
    secretAccessKey: AWS_SES_SECRET_ACCESS_KEY,
});

export async function _onCreateInvite(inviteDocSnapshot: DocumentSnapshot) {
    if (process.env.AWS_SES_ACCESS_KEY === '' || process.env.AWS_SES_SECRET_ACCESS_KEY === '') {
        return functions.logger.error(
            'System email credentials not configured, configure them in the .env.local file, compile the functions again and make a new deploy'
        );
    } else if (process.env.APP_DOMAIN === '') {
        return functions.logger.error(
            'System domain to show in emails not configured, configure it in the .env.local file, compile the functions again and make a new deploy'
        );
    } else if (process.env.APP_MAIL_SOURCE === '') {
        return functions.logger.error(
            'System email source to show in emails not configured, configure it in the .env.local file, compile the functions again and make a new deploy'
        );
    }

    const inviteEntry = inviteDocSnapshot.data() as Invite;

    await ses
        .sendEmail({
            Source: APP_MAIL_SOURCE,
            ReplyToAddresses: [APP_MAIL_SOURCE],
            Destination: {
                ToAddresses: [inviteEntry.email],
            },
            Message: {
                Subject: {
                    Data: 'Convite para administrar sistema do MLB!',
                },
                Body: {
                    Html: {
                        Data: invitesEmailTemplate,
                    },
                },
            },
        })
        .promise();
}

/**
 * Send email to user invited informing him that he was asked to manage the system data
 */
export const onCreateInvite = functions
    .runWith({ memory: '128MB' })
    .firestore.document(`${invitesCollectionName}/{inviteId}`)
    .onCreate(_onCreateInvite);

/**
 * A cron function that run every 24 hours to delete expired invites
 * (expired invitations are invitations that are older than 72 hours)
 */
export const deleteExpiredInvites = functions
    .runWith({ memory: '128MB' })
    .pubsub.schedule('every 24 hours')
    .timeZone('America/Bahia')
    .onRun(async () => {
        const threeDaysAgo = threeDaysAgoFactory();

        const querySnapshot = await admin
            .firestore()
            .collection(invitesCollectionName)
            .where('createdAt' as keyof Invite, '<=', threeDaysAgo)
            .get();

        const batch = admin.firestore().batch();

        for (let doc of querySnapshot.docs) {
            batch.delete(doc.ref);
        }

        await batch.commit();

        return null;
    });
