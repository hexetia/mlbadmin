import React from 'react';
import { IPagedFirestoreQuery } from '../firebase/getOccupationsOrAffiliates';
import { IAffiliate } from '../../../../types/__project_defs/IAffiliate';
import { FiliadosView } from './FiliadoList';
import { AffiliateListItem } from './AffiliateListItem';
import { LinearProgress } from '@material-ui/core';
import type { InfiniteData } from 'react-query';

export function AffiliatesListPages(props: {
    pages?: InfiniteData<IPagedFirestoreQuery<IAffiliate>>;
    showBirthday?: boolean;
    showOccupationName?: boolean;
    showCity?: boolean;
}) {
    if (!props.pages) {
        return <LinearProgress variant='indeterminate' style={{ width: '100%' }} />;
    }

    return (
        <FiliadosView>
            {props.pages.pages?.map(page =>
                page.items.map(affiliate => (
                    <AffiliateListItem
                        key={affiliate.id}
                        affiliate={affiliate}
                        showOccupationName={props.showOccupationName}
                        showBirthday={props.showBirthday}
                        showCpf
                        showCity={props.showCity}
                        data-testid='affiliateListItem'
                        data-testitemid={affiliate.id}
                    />
                ))
            )}
        </FiliadosView>
    );
}
