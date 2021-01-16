import { IAddress } from './IAddress';
import { UnprocessedImage } from './UnprocessedImage';
import { EducationLevel } from 'front/src/enums/EducationLevel';
import { MaritalStatus } from 'front/src/enums/MaritalStatus';
import { Genre } from 'front/src/enums/Genre';
import { FirebaseSearchableDateObject } from 'front/src/utils/dateUtils';

export interface IAffiliate {
    id?: string;
    photo: string | UnprocessedImage;
    name: string;
    name_lowercase?: string;
    cpf: string;
    rg: string;
    nis: string;
    birthday: string | FirebaseSearchableDateObject;
    maritalStatus: MaritalStatus;
    educationLevel: EducationLevel;
    genre: Genre;

    phoneNumber: string;

    note: string;

    occupationId: string;

    address: IAddress;

    useOccupationAddress: boolean;

    createdAt?: Date;
    changedAt?: Date;
}
