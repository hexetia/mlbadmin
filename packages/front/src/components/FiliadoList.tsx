import React from 'react';
import styled from 'styled-components';
import { AffiliateListItem } from './AffiliateListItem';
import { IAffiliate } from '../../../../types/__project_defs/IAffiliate';

export const FiliadoList = (props: { affiliates: IAffiliate[]; showOcupacaoNome?: boolean }) => {
    return (
        <FiliadosView>
            {props.affiliates.map(affiliate => (
                <AffiliateListItem key={affiliate.id} affiliate={affiliate} showOccupationName={props.showOcupacaoNome} />
            ))}
        </FiliadosView>
    );
};

export const FiliadosView = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
`;
