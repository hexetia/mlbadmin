/**
 * Return the file extension without dot
 *
 * example: 'myImage.jpg' will return 'jpg',
 * nothing.svg will return 'svg'
 * @param filename
 */
export const fileExtension = (filename: string): string => {
    const a = filename.split('.');
    if (a.length === 1 || (a[0] === '' && a.length === 2)) {
        return '';
    }

    return a.pop() as string;
};
