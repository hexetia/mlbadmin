import { ROLES } from 'front/src/enums/ROLES';

export interface Invite {
    id?: string;

    email: string;
    role: ROLES;
    createdBy: {
        email: string;
        name: string;
    };
    createdAt?: Date;
}
