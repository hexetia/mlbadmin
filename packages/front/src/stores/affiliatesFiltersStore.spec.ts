import { AffiliatesFiltersStore } from './affiliatesFiltersStore';

test('affiliates filters store should only allow one inequality filter value in store', () => {
    const store = new AffiliatesFiltersStore();
    store.changeFilter('name_lowercase', 'oi');

    expect(store.name_lowercase.value).toBe('oi');

    store.changeFilter('cpf', '051');

    expect(store.name_lowercase.value).toBe('');
    expect(store.cpf.value).toBe('051');

    store.changeFilter('rg', '6554');

    expect(store.cpf.value).toBe('');
    expect(store.rg.value).toBe('6554');
});
