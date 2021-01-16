import { FireFilter } from '../components/filters/FireFilter';
import { debounce } from 'mini-debounce';
import { computed, makeAutoObservable, runInAction } from 'mobx';
import { createContext } from 'react';
import { ExclusionPolicy, Expose, serialize, Strategy } from 'typeserializer';

export interface IOccupationFilters {
    name_lowercase: FireFilter<string>;
    'address.state': FireFilter<string>;
    'address.city': FireFilter<string>;
}

@Strategy(ExclusionPolicy.ALL)
class OccupationsFiltersStore implements IOccupationFilters {
    @Expose()
    name_lowercase: FireFilter<string> = {
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

    constructor() {
        makeAutoObservable(this);
    }

    changeFilter = (key: keyof IOccupationFilters, value: string) => {
        runInAction(() => {
            this[key].value = value;
        });
    };

    debounceChangeFilter = debounce(this.changeFilter, 500);

    @computed
    get asString() {
        return serialize(this);
    }
}
const instance = new OccupationsFiltersStore();
export const occupationsFiltersStoreContext = createContext(instance);

export function resetOccupationFilters() {
    runInAction(() => {
        instance.name_lowercase.value = '';
        instance['address.state'].value = '';
        instance['address.city'].value = '';
    });
}
