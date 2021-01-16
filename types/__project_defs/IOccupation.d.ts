import { IAddress } from './IAddress';
import { UnprocessedImage } from './UnprocessedImage';

export interface IOccupation {
    id?: string;
    name: string;
    address: IAddress;
    note: string;
    photo: string | UnprocessedImage;
    totalAffiliates?: number;
    createdDate?: Date;
    changedDate?: Date;
}
