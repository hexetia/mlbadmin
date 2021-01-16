import React, { useMemo, useState } from 'react';
import { OccupationRepository } from '../repository/OccupationRepository';
import { toast } from 'react-toastify';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import { IOccupation } from '../../../../types/__project_defs/IOccupation';
import { AffiliateRepository } from '../repository/AffiliateRepository';
import { fireDB } from '../firebase/fireApp';
import { occupationCollectionName } from '../constants';
import { useFirestoreQuery } from '../customHooks/useFirestoreQuery';
import { GuardPage } from '../security/GuardPage';
import { ROLES } from '../enums/ROLES';
import deepMerge from 'deepmerge';
import { IAffiliate } from '../../../../types/__project_defs/IAffiliate';
import { nanoid } from 'nanoid/non-secure';
import faker from 'faker/locale/pt_BR';
import { generateCPF } from '@brazilian-utils/brazilian-utils';
import { randomInt } from '../utils/randomInt';
import { FirebaseSearchableDateObject } from '../utils/dateUtils';
import { MaritalStatus } from '../enums/MaritalStatus';
import { Genre } from '../enums/Genre';
import { EducationLevel } from '../enums/EducationLevel';
import { loremIpsum } from 'lorem-ipsum';
import { IAddress } from '../../../../types/__project_defs/IAddress';
import normalizeText from 'normalize-text';

const randomImages = [
    'https://images.pexels.com/photos/3695219/pexels-photo-3695219.jpeg',
    'https://images.pexels.com/photos/3556533/pexels-photo-3556533.jpeg',
    'https://images.pexels.com/photos/106258/pexels-photo-106258.jpeg',
    'https://images.pexels.com/photos/1456951/pexels-photo-1456951.jpeg',
    'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    'https://images.pexels.com/photos/1439317/pexels-photo-1439317.jpeg',
    'https://images.pexels.com/photos/1447358/pexels-photo-1447358.jpeg',
    'https://images.pexels.com/photos/1254690/pexels-photo-1254690.jpeg',
    'https://images.pexels.com/photos/1461101/pexels-photo-1461101.jpeg',
    'https://images.pexels.com/photos/1753798/pexels-photo-1753798.jpeg',
    'https://images.pexels.com/photos/1430627/pexels-photo-1430627.jpeg',
    'https://images.pexels.com/photos/417801/pexels-photo-417801.jpeg',
    'https://images.pexels.com/photos/1058950/pexels-photo-1058950.jpeg',
    'https://images.pexels.com/photos/1425452/pexels-photo-1425452.jpeg',
    'https://images.pexels.com/photos/247519/pexels-photo-247519.jpeg',
    'https://images.pexels.com/photos/1413883/pexels-photo-1413883.jpeg',
    'https://images.pexels.com/photos/1471141/pexels-photo-1471141.jpeg',
    'https://images.pexels.com/photos/1545499/pexels-photo-1545499.jpeg',
    'https://images.pexels.com/photos/1416945/pexels-photo-1416945.jpeg',
    'https://images.pexels.com/photos/1587651/pexels-photo-1587651.jpeg',
    'https://images.pexels.com/photos/1587619/pexels-photo-1587619.jpeg',
    'https://images.pexels.com/photos/3933412/pexels-photo-3933412.jpeg',
    'https://images.pexels.com/photos/1721613/pexels-photo-1721613.jpeg',
    'https://images.pexels.com/photos/1751596/pexels-photo-1751596.jpeg',
    'https://images.pexels.com/photos/3321515/pexels-photo-3321515.jpeg',
];

export function createFakeAffiliate(occupation?: Partial<IOccupation>, affiliate?: Partial<IAffiliate>): IAffiliate {
    const id = nanoid();
    const nome = affiliate?.name || faker.name.findName();

    let createdAffiliate: IAffiliate = {
        id,
        photo: `https://acryvhvcwp.cloudimg.io/v7/${randomImages[randomInt(0, randomImages.length - 1)]}?w=500&h=500`,
        name: nome,
        cpf: generateCPF(),
        rg: `${randomInt(111_111_111, 999_999_999)}`,
        nis: `${randomInt(1111, 9999)}`,
        birthday: {
            day: (affiliate?.birthday as FirebaseSearchableDateObject)?.day || randomInt(1, 28),
            month: (affiliate?.birthday as FirebaseSearchableDateObject)?.month || randomInt(1, 12),
            year: (affiliate?.birthday as FirebaseSearchableDateObject)?.year || 1990,
        },
        maritalStatus:
            MaritalStatus[Object.keys(MaritalStatus)[randomInt(0, Object.keys(MaritalStatus).length - 1)] as keyof typeof MaritalStatus],
        genre: Genre[Object.keys(Genre)[randomInt(0, Object.keys(Genre).length - 1)] as keyof typeof Genre],
        educationLevel:
            EducationLevel[
                Object.keys(EducationLevel)[randomInt(0, Object.keys(EducationLevel).length - 1)] as keyof typeof EducationLevel
            ],
        phoneNumber: '11 1234-1234',
        note: loremIpsum({ count: 5 }),
        occupationId: occupation?.id || '',
        address: createFakeAddress(),
        useOccupationAddress: false,
    };

    createdAffiliate.name_lowercase = normalizeText(createdAffiliate.name.toLowerCase());

    return createdAffiliate;
}

export function createFakeAddress(): IAddress {
    const enderecoList: IAddress[] = [
        {
            cep: '01259-020',
            state: 'São Paulo',
            city: 'São Paulo',
            neighborhood: 'Sumaré',
            street: 'Rua Bruxelas',
            number: '1004',
            complement: '',
        },
        {
            cep: '50050-080',
            state: 'Pernambuco',
            city: 'Recife',
            neighborhood: 'Boa Vista',
            street: 'R. do Sossego',
            number: '342',
            complement: '',
        },
    ];

    return enderecoList[randomInt(0, enderecoList.length - 1)];
}

export function createFakeOccupation(partialOccupation?: Partial<IOccupation>): IOccupation {
    const id = nanoid();
    const name = faker.commerce.productName();

    const ocu = partialOccupation || {};

    return deepMerge(
        {
            id,
            photo: `https://www.assets.hawkbydesign.com/randomanime/images/anime/${randomInt(1, 1465)}/home-l.webp`,
            name,
            address: createFakeAddress(),
            note: faker.lorem.paragraphs(2),
            totalAffiliates: 0,
        },
        ocu
    );
}

const CriarVariosFiliados = (props: { ocupacao?: IOccupation }) => {
    const [numeroFiliados, setNumberoFiliados] = useState(1);
    const repo = new AffiliateRepository(fireDB);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNumberoFiliados(parseInt(event.target?.value as string));
    };

    const handleClick = async () => {
        for (let i = 0; i < numeroFiliados; i++) {
            await repo.save(createFakeAffiliate(props.ocupacao));
        }

        toast(`${numeroFiliados} filiados criados`);
    };

    return (
        <div style={{ marginTop: 10, marginBottom: 10, display: 'flex', alignItems: 'baseline' }}>
            <TextField label='Quantos filiados fakes?' type='number' value={numeroFiliados} onChange={handleChange} />
            <Button css='margin-left: 8px' disabled={props.ocupacao === undefined} onClick={handleClick} variant='outlined' color='primary'>
                Criar
            </Button>
        </div>
    );
};

const Fake = () => {
    const [ocupacaoSelectedIndex, setOcupacaoSelectedIndex] = useState<number>(0);
    const { data } = useFirestoreQuery(fireDB.collection(occupationCollectionName).limit(5));
    const ocupacoes = data || [];
    const repository = useMemo<OccupationRepository>(() => new OccupationRepository(fireDB), []);

    const makeOcupacao = () => {
        const ocupacao = createFakeOccupation();
        repository.save(ocupacao).then(() => {
            toast(`Ocupação criada`);
        });
    };

    return (
        <Container css='width: 100%; margin-top: 50px'>
            <div css='display: flex;margin-bottom: 50px'>
                <Button onClick={makeOcupacao} variant='outlined' color='primary'>
                    Criar ocupacão aleatória
                </Button>
            </div>

            <hr />

            <label htmlFor='ocupacaoSelect'>Ocupação </label>
            <select
                id='ocupacaoSelect'
                onChange={event => setOcupacaoSelectedIndex(parseInt(event.target.value))}
                value={ocupacaoSelectedIndex}
            >
                {ocupacoes!.map((ocup: IOccupation, index: number) => (
                    <option key={ocup.id} value={index}>
                        {ocup.name}
                    </option>
                ))}
            </select>

            <CriarVariosFiliados ocupacao={ocupacoes![ocupacaoSelectedIndex]} />
        </Container>
    );
};

export default GuardPage(ROLES.CONTENT_EDITOR, Fake);
