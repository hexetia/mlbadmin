import fs from 'fs';
const { nativeCopyDirSync } = require('../../scripts/ciFs');

test('copy dir can ignoring sub dirs if needed', () => {
    const sourceDir = fs.mkdtempSync('/tmp/a-nani');
    // call mkdtempSync just to get a random targetDir name
    const targetDir = fs.mkdtempSync('/tmp/a-shindeiru');

    // the copy function should automatically create the target dir
    fs.rmdirSync(targetDir);

    fs.mkdirSync(`${sourceDir}/oi/hello/tatapaum`, { recursive: true });

    fs.mkdirSync(`${sourceDir}/oi/ignoreMe/tatapaum`, { recursive: true });
    fs.mkdirSync(`${sourceDir}/oi/ignoreMeToo/tatapaum`, { recursive: true });

    fs.writeFileSync(`${sourceDir}/oi/hello/tatapaum/hey.txt`, '');
    fs.writeFileSync(`${sourceDir}/oi/ignoreMe/hey.txt`, '');
    fs.writeFileSync(`${sourceDir}/oi/ignoreMe/tatapaum/hey.txt`, '');
    fs.writeFileSync(`${sourceDir}/oi/ignoreMeToo/hey.txt`, '');

    fs.writeFileSync(`${sourceDir}/hey.txt`, '');
    fs.writeFileSync(`${sourceDir}/oi/hey.txt`, '');
    fs.writeFileSync(`${sourceDir}/oi/hello/hey.txt`, '');

    nativeCopyDirSync(sourceDir, [`${sourceDir}/oi/ignoreMe`], targetDir);

    expect(fs.statSync(targetDir).isDirectory()).toBeTruthy();
    expect(fs.statSync(`${targetDir}/oi/hello/tatapaum`).isDirectory()).toBeTruthy();
    expect(fs.statSync(`${targetDir}/oi/hello/tatapaum/hey.txt`).isFile()).toBeTruthy();

    expect(fs.existsSync(`${targetDir}/oi/ignoreMe`)).toBeFalsy();

    fs.rmdirSync(sourceDir, { recursive: true });
    fs.rmdirSync(targetDir, { recursive: true });
});
