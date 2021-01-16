import { observable } from 'mobx';

/**
 * Texts on affiliatesFiltersStore.ts is stored with bounced functions
 */
export const affiliatesFiltersTextsStore = observable({
    texts: { name_lowercase: '', cpf: '', rg: '' },
});
