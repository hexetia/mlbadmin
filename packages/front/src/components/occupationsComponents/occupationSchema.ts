import * as yup from 'yup';
import { notEmptyStr } from '../../utils/StringUtils';

export const occupationSchema = yup.object().shape({
    photo: yup.mixed().test('photo', 'A ocupação precisa de uma capa', function (this, value) {
        if (typeof value === 'string') {
            return notEmptyStr(value);
        } else {
            return !(value instanceof Blob);
        }
    }),
    name: yup.string().required('Insira o nome da ocupação'),
    address: yup.object({
        state: yup.string().required('É necessário informar o estado'),
        city: yup.string().required('É necessário informar a cidade'),
    }),
});
