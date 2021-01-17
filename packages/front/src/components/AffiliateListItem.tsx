import React, { useMemo } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { IAffiliate } from '../../../../types/__project_defs/IAffiliate';
import { formatCPF } from '@brazilian-utils/brazilian-utils';
import { notEmptyStr } from '../utils/StringUtils';
import { formatBirthDayBr } from '../utils/dateUtils';
import Link from 'next/link';
import { FirebaseImage } from '../firebase/FirebaseImage';
import { Skeleton } from '@material-ui/lab';
import { useQuery } from 'react-query';
import { OccupationRepository } from '../repository/OccupationRepository';
import { IOccupation } from '../../../../types/__project_defs/IOccupation';
import { IAddress } from '../../../../types/__project_defs/IAddress';

/**
 * Não é bom que a lista de ocupações seja uma talela, pois vai limitar a forma como exibimos os items no mobile,
 * é dificil deixar uma tabela responsiva que tenha uma boa UX no mobile
 */
export const AffiliateListItem = ({
    className,
    affiliate: { phoneNumber, cpf, photo, id, birthday, name, occupationId, address, useOccupationAddress },
    showBirthday,
    showCpf,
    showOccupationName,
    showCity,
    ...rest
}: {
    className?: string;
    affiliate: IAffiliate;
    showOccupationName?: boolean;
    showBirthday?: boolean;
    showCpf?: boolean;
    showCity?: boolean;
}) => {
    const occupationRepository = useMemo(() => new OccupationRepository(window.fireDB), []);
    // don't worry about firebase quota, that query have cache and invalidation when an occupation update
    // react-query automatically dedup multiple requests for the same data
    const { data } = useQuery<IOccupation>(`occupation_${occupationId}`, () => occupationRepository.findById(occupationId), {
        staleTime: 3600_000,
        cacheTime: 3600_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: showOccupationName && occupationId !== '',
    });

    const realAddress = (useOccupationAddress ? data?.address || {} : address) as IAddress;

    return (
        <Link href={`/filiados/${id}`} passHref>
            <StyledLink {...rest} className={className}>
                <Paper variant='outlined' elevation={2}>
                    <div css='display: flex; align-items: center;'>
                        <FirebaseImage
                            src={photo as string}
                            Component={props => <img {...props} alt={`Foto de ${name}`} css='width: 75px;height: 75px' />}
                            Fallback={() => <Skeleton variant='rect' width={75} height={75} />}
                        />
                        <div css='display: flex;flex-direction: column; margin-left: 10px'>
                            <Typography variant='h6'>{name}</Typography>
                            {showCpf && <Typography variant='subtitle2'>CPF {formatCPF(cpf)}</Typography>}
                            <Typography variant='subtitle2'>{phoneNumber}</Typography>
                            {showBirthday && <Typography variant='subtitle2'>{formatBirthDayBr(birthday)}</Typography>}
                            {showCity && notEmptyStr(realAddress.city) && (
                                <Typography variant='subtitle2'>
                                    {realAddress.state} - {realAddress.city}
                                </Typography>
                            )}
                        </div>
                    </div>
                    {showOccupationName && notEmptyStr(occupationId) && data && (
                        <>
                            <Typography variant='caption' display='inline' style={{ fontWeight: 500 }}>
                                Ocupação: {data.name}
                                {/*Ocupação: {occupationId}*/}
                            </Typography>
                        </>
                    )}
                </Paper>
            </StyledLink>
        </Link>
    );
};

export const StyledLink = styled.a`
    text-decoration: none;
    width: 100%;
    margin: 8px 0;

    & > .MuiPaper-root {
        padding: 8px;
    }

    ${props => props.theme.breakpoints.up('md')} {
        width: 48%;
        margin: 12px 0;

        & > .MuiPaper-root {
            padding: 8px;
        }
    }
`;
