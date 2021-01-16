import { FireFilter } from '../components/filters/FireFilter';
import { ExclusionPolicy, Expose, serialize, Strategy } from 'typeserializer';
import { action, computed, makeAutoObservable, runInAction } from 'mobx';
import { debounce } from 'mini-debounce';
import { createContext } from 'react';

export interface IAffiliatesFilters {
    name_lowercase: FireFilter<string>;
    cpf: FireFilter<string>;
    rg: FireFilter<string>;
    'address.state': FireFilter<string>;
    'address.city': FireFilter<string>;
    occupationId: FireFilter<string>;
}

@Strategy(ExclusionPolicy.ALL)
export class AffiliatesFiltersStore {
    @Expose()
    name_lowercase: FireFilter<string> = {
        type: 'stringStartsWith',
        value: '',
    };

    @Expose()
    cpf: FireFilter<string> = {
        type: 'stringStartsWith',
        value: '',
    };

    @Expose()
    rg: FireFilter<string> = {
        type: 'stringStartsWith',
        value: '',
    };

    @Expose()
    'address.state': FireFilter<string> = {
        type: 'equal',
        value: '',
    };

    @Expose()
    'address.city': FireFilter<string> = {
        type: 'equal',
        value: '',
    };

    @Expose()
    'occupation.id': FireFilter<string> = {
        type: 'equal',
        value: '',
    };

    constructor() {
        makeAutoObservable(this);
    }

    changeFilter = (key: keyof IAffiliatesFilters, value: string) => {
        // firestore allow just one inequality filter per query
        // that loop will reset blank all inequality filters
        if (this[key].type === 'stringStartsWith') {
            for (const prop in this) {
                const item = this[prop as keyof AffiliatesFiltersStore];
                if (typeof item === 'object' && item!.hasOwnProperty('type') && (item as FireFilter<string>).type === 'stringStartsWith') {
                    runInAction(() => {
                        (this[prop as keyof AffiliatesFiltersStore] as FireFilter<string>).value = '';
                    });
                }
            }
        }

        runInAction(() => {
            this[key].value = value;
        });
    };

    debounceChangeFilter = debounce(this.changeFilter, 500);

    @computed
    get asString(): string {
        return serialize(this);
    }
}

const instance = new AffiliatesFiltersStore();
export const affiliatesFiltersStoreContext = createContext(instance);

export function resetAffiliatesFiltersStore() {
    runInAction(() => {
        instance.name_lowercase.value = '';
        instance.cpf.value = '';
        instance.rg.value = '';
        instance['address.city'].value = '';
        instance['address.state'].value = '';
        instance['occupation.id'].value = '';
    });
}

/**
 * Having multiple 'inequality filters' on multiple properties isn't possible in Cloud Firestore
 */
export const affiliatesFiltersStoreInequalityFilters: string[] = (() => {
    const inequalityPropList: string[] = [];
    for (const prop in instance) {
        if (
            typeof instance[prop as keyof typeof instance] === 'object' &&
            (instance[prop as keyof typeof instance] as FireFilter<string>).type === 'stringStartsWith'
        ) {
            inequalityPropList.push(prop);
        }
    }

    return inequalityPropList;
})();
