import * as yup from 'yup';
import { notEmptyStr } from '../../utils/StringUtils';
import { isFullName } from '../../utils/isFullName';
import { isValidCPF } from '@brazilian-utils/brazilian-utils';
import { isValidDateString } from '../../utils/dateUtils';
import { affiliatesCollectionName } from '../../constants';

export const affiliateFormSchema = yup.object().shape({
    photo: yup.mixed().test('photo', 'O filiado precisa de uma foto', function (this, value) {
        if (typeof value === 'string') {
            return notEmptyStr(value);
        } else {
            return !(value instanceof Blob);
        }
    }),
    name: yup.string().test('nomeCompleto', 'O nome deve ter NOME e SOBRENOME', function (this, value) {
        return isFullName(value);
    }),
    cpf: yup
        .string()
        .test('isValidCPF', 'CPF inválido', function (this, value) {
            return isValidCPF(value as string);
        })
        .test('isCpfDuplicated', 'CPF Duplicado, já existe um filiado usando esse cpf', async function (this, value) {
            if (!isValidCPF(value)) {
                return false;
            } else {
                // check if cpf is already used
                const querySnap = await window.fireDB.collection(affiliatesCollectionName).where('cpf', '==', value).get();

                if (!querySnap.empty) {
                    return querySnap.docs[0].data().id === this.parent.id;
                } else {
                    return true;
                }
            }
        }),
    birthday: yup.string().test('isNascimentoValid', 'Data de Nascimento inválida', function (this, value) {
        if (typeof value !== 'string') {
            return true;
        }

        return isValidDateString(value);
    }),
});
