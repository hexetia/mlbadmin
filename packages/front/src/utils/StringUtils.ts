export const notEmptyStr = (value: string | any) => {
    if (typeof value !== 'string') {
        return false;
    }

    return value.trim() !== '';
};

export const emptyStr = (value: string) => {
    if (typeof value !== 'string') {
        return true;
    }

    return value.trim() === '';
};
