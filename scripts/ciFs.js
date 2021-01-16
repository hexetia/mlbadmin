const fs = require('fs');

/**
 *
 * @param dir {string}
 * @param ignoreDirsOrFiles {string[]}
 * @param dirs
 * @param files
 * @returns {{dirs: [], files: []}}
 */
function traverse(dir, ignoreDirsOrFiles = [], dirs = [], files = []) {
    if (!fs.existsSync(dir)) {
        console.warn('traverse() Warning: dir', dir, 'don`t exists, returning empty values');

        return { dirs: [], files: [] };
    }

    fs.readdirSync(dir, { withFileTypes: true }).forEach(item => {
        if (item.isFile()) {
            if (!ignoreDirsOrFiles.includes(`${dir}/${item.name}`)) {
                files.push(`${dir}/${item.name}`);
            }
        } else {
            const itemDir = `${dir}/${item.name}`;

            if (!ignoreDirsOrFiles.includes(itemDir)) {
                dirs.push(itemDir);
                traverse(itemDir, ignoreDirsOrFiles, dirs, files);
            }
        }
    });

    return { dirs, files };
}

exports.traverse = traverse;

/**
 * Simple implementation using native node apis to make a install script with docker
 *
 * to ignore a path, pass the pathname without backslash, like: ./ignoreMe/oi
 *
 * @param sourceDir {string}
 * @param ignoreDirsOrFiles {string[]}
 * @param targetDir {string}
 * @param options
 *
 * @return {{dirsToCreate: string[], filesToCopy: string[]}}
 */
exports.nativeCopyDirSync = function nativeCopyDirSync(sourceDir, ignoreDirsOrFiles = [], targetDir, options = { dryRun: false }) {
    if (!options.dryRun && !fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const { dirs, files } = traverse(sourceDir, ignoreDirsOrFiles);

    if (options.dryRun) {
        return {
            dirsToCreate: dirs.map(item => item.replace(sourceDir, targetDir)),
            filesToCopy: files,
        };
    }

    dirs.map(item => item.replace(sourceDir, targetDir)).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    });

    files.forEach(file => {
        fs.copyFileSync(file, file.replace(sourceDir, targetDir));
    });
};
