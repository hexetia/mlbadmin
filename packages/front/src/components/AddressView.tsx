import { notEmptyStr } from '../utils/StringUtils';
import { Typography } from '@material-ui/core';
import { AffTextBlock } from './affiliatesComponents/AffiliatePageStyles';
import { IAddress } from '../../../../types/__project_defs/IAddress';

const allAddressFieldsEmpty = address => !Object.values(address).some(value => value !== '');

export const AddressView = ({ address }: { address: IAddress }) => {
    if (allAddressFieldsEmpty(address)) {
        return null;
    }

    return (
        <AffTextBlock>
            <Typography variant='subtitle1'>Endereço</Typography>
            {notEmptyStr(address.street!) && (
                <Typography variant='subtitle2'>
                    {address.street} {notEmptyStr(address.number!) && '- ' + address.number}
                </Typography>
            )}
            {notEmptyStr(address.complement!) && <Typography variant='subtitle2'>{address.complement}</Typography>}
            {notEmptyStr(address.neighborhood!) && <Typography variant='subtitle2'>{address.neighborhood}</Typography>}
            {notEmptyStr(address.city) && notEmptyStr(address.state) ? (
                <Typography variant='subtitle2'>
                    {address.city} - {address.state}
                </Typography>
            ) : (
                <>
                    {notEmptyStr(address.state) && <Typography variant='subtitle2'>{address.state}</Typography>}

                    {notEmptyStr(address.city) && <Typography variant='subtitle2'>{address.city}</Typography>}
                </>
            )}
        </AffTextBlock>
    );
};
