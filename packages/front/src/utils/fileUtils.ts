/**
 * Extract the filename wihout extension from unix file path
 * **only works on unix like paths
 * @param filename
 */
export function basename(filename: string): string {
    let base = new String(filename).substring(filename.lastIndexOf('/') + 1);

    if (base.lastIndexOf('.') != -1) {
        base = base.substring(0, base.lastIndexOf('.'));
    }

    return base;
}
