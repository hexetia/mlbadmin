const childProcess = require('child_process');
const showEmulatorLogs = process.env.RUNNER_EMULATOR_LOGS === 'true';

console.log(`Available envs:

RUNNER_EMULATOR_LOGS=boolean

Current envs:
${JSON.stringify(process.env)}

`);

childProcess.execSync('yarn build:functions', { stdio: 'inherit' });

const nextJsProcess = childProcess.spawn('yarn', ['start'], { stdio: 'inherit' });

// todo use that implementation to run tests on quiet flag is implemented https://github.com/firebase/firebase-tools/issues/2859
// firebase emulator print a huge amount of logs, until we can silent then we use the implementation below
// to suppress firebase non-error logs
// try {
//     childProcess.execSync('firebase emulators:exec "yarn test:integration"', { stdio: 'inherit' });
// } catch (error) {
//     nextJsServer.kill(error.status);
// }

const emulatorsProcess = childProcess.spawn('firebase', ['emulators:start'], { cwd: process.env.PWD, stdio: 'pipe' });

let emulatorsReady = false;
emulatorsProcess.stdout.on('data', data => {
    const log = data.toString();

    if (emulatorsReady) {
        if (showEmulatorLogs) {
            console.log(log);
        } else if (log.toLowerCase().includes('error')) {
            console.log(data.toString());
        }
    } else {
        console.log(log);

        if (data.toString().includes('All emulators ready!')) {
            emulatorsReady = true;

            try {
                childProcess.execSync(`yarn test:integration`, { stdio: 'inherit' });
                // childProcess.execSync('yarn test:integration --runTestsByPath ./__tests__/src/pages/occupation.integration.spec.ts', {
                //     stdio: 'inherit',
                // });
            } catch (e) {
                process.exit(e.status);
            } finally {
                emulatorsProcess.kill(0);
                nextJsProcess.kill(0);
                process.exit(0);
            }
        }
    }
});
