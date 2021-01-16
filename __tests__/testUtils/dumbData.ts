import faker from 'faker/locale/pt_BR';
import type { IAffiliate } from '../../types/__project_defs/IAffiliate';
import { nanoid } from 'nanoid';
import type { IOccupation } from '../../types/__project_defs/IOccupation';
import { randomInt } from 'front/src/utils/randomInt';
import type { IAddress } from '../../types/__project_defs/IAddress';
import { generateCPF } from '@brazilian-utils/brazilian-utils';
import { loremIpsum } from 'lorem-ipsum';
import { EducationLevel } from 'front/src/enums/EducationLevel';
import { Genre } from 'front/src/enums/Genre';
import { MaritalStatus } from 'front/src/enums/MaritalStatus';
import { FirebaseSearchableDateObject } from 'front/src/utils/dateUtils';
import { normalizeText } from 'normalize-text';
import deepMerge from 'deepmerge';

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
        rg: `${randomInt(0, 9)}${randomInt(0, 9)}${randomInt(0, 9)}${randomInt(0, 9)}${randomInt(0, 9)}${randomInt(0, 9)}${randomInt(
            0,
            9
        )}${randomInt(0, 9)}${randomInt(0, 9)}`,
        nis: `${randomInt(0, 9)}${randomInt(0, 9)}${randomInt(0, 9)}${randomInt(0, 9)}`,
        birthday: {
            day: (affiliate?.birthday as FirebaseSearchableDateObject)?.day || randomInt(1, 28),
            month: (affiliate?.birthday as FirebaseSearchableDateObject)?.month || randomInt(1, 12),
            year: (affiliate?.birthday as FirebaseSearchableDateObject)?.year || 1990,
        },
        // birthday: `${randomInt(1, 28).toString().padStart(2, '0')}/${randomInt(1, 12).toString().padStart(2, '0')}/1990`,
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
            cep: '65930-000',
            state: 'Maranhão',
            city: 'Açailândia',
            neighborhood: 'Centro',
            street: 'Rua Alameda',
            number: '66',
            complement: '',
        },
        {
            cep: '52050-030',
            state: 'Pernambuco',
            city: 'Garanhuns',
            neighborhood: 'Encruzilhada',
            street: 'R. Carneiro Viléla',
            number: '138',
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
