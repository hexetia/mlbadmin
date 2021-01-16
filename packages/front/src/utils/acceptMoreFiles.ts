import numd from 'numd';
import { toast } from 'react-toastify';

/**
 * Show a toast if current number of files + new files exceeds maxFiles
 *
 * @param currentFiles
 * @param newFiles
 * @param maxFiles
 */
export function acceptMoreFiles(currentFiles: number, newFiles: number, maxFiles: number): boolean {
    if (currentFiles === maxFiles) {
        return false;
    } else if (currentFiles + newFiles > maxFiles) {
        const requestedNumberFiles = numd(newFiles, 'arquivo', 'arquivos');
        const remainingFilesPluralized = numd(maxFiles - currentFiles, 'arquivo', 'arquivos');
        toast.error(`Erro: Você tentou anexar ${requestedNumberFiles}, Mas só pode enviar mais ${remainingFilesPluralized}`);

        return false;
    }

    return true;
}
