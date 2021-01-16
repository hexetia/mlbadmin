import cep from 'cep-promise';
import { estados } from '../utils/estados';
import { isValidCEP } from '@brazilian-utils/brazilian-utils';
import cepFillStore from '../stores/cepFillStore';
import pMinDelay from 'p-min-delay';
import { runInAction } from 'mobx';

/**
 * Essa função recebe o cep pelo onChange do campo CEP e então faz o trabalho sujo aqui
 *
 * This implementation have a concurrency problem, maybe to fix we need to use react-hook-form.useWatch
 * or add a requestId in cepFillStore
 */
export const cepFillService = (setValue: any) => (cepRequested: string) => {
    if (!isValidCEP(cepRequested)) {
        return;
    }
    runInAction(() => {
        cepFillStore.set('loading');
    });

    pMinDelay(cep(cepRequested), 3000)
        .then(response => {
            runInAction(() => {
                cepFillStore.set('idle');
            });
            setValue('address.street', response.street, { shouldDirty: false, shouldValidate: false });
            setValue('address.neighborhood', response.neighborhood, { shouldDirty: false, shouldValidate: false });
            setValue('address.city', response.city, { shouldDirty: false, shouldValidate: true });
            setValue('address.state', estados[response.state as keyof typeof estados], { shouldDirty: false, shouldValidate: true });
        })
        .catch(() => {
            runInAction(() => {
                console.log('setando erro');
                cepFillStore.set('error');
            });
        });
};
