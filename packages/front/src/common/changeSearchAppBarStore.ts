import router from 'next/router';
import { runInAction } from 'mobx';
import { AffiliatesFiltersStore } from '../stores/affiliatesFiltersStore';
import pWaitFor from 'p-wait-for';

export const changeSearchAppBarStore = (currentInput: HTMLInputElement, filtersStore: AffiliatesFiltersStore, value: string) => {
    const searchFor = currentInput.value;
    currentInput.blur();
    currentInput.value = '';
    runInAction(() => filtersStore.changeFilter('name_lowercase', value));

    router.push('/filiados').then(() => {
        const getAffiliatesInputPage = () => document.querySelector('input[name="name_lowercase"]') as HTMLInputElement | null;

        pWaitFor(() => getAffiliatesInputPage() != null).then(() => {
            getAffiliatesInputPage()!.focus();
            getAffiliatesInputPage()!.value = searchFor;
        });
    });
};
