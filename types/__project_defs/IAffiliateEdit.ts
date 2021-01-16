import { IAffiliate } from './IAffiliate';
import { IOccupation } from './IOccupation';

export interface IAffiliateEdit extends IAffiliate {
    occupation?: Partial<IOccupation>;
}
