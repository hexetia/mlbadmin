export const isFullName = (nome: string | any): boolean => {
    if (typeof nome !== 'string') {
        return false;
    }

    const nomeSplited = nome.split(' ');
    if (nomeSplited.length < 2) {
        return false;
    }

    const namePartsWithMoreThanTwoChars = nomeSplited.filter(namePart => namePart.length >= 2);

    return namePartsWithMoreThanTwoChars.length >= 2;
};
