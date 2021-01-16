require('dotenv').config({ path: __dirname + '/../.env.local' });
const fs = require('fs');
const { traverse } = require('./ciFs');
const { buildSync } = require('esbuild');

const define = {};

for (const k in process.env) {
    define[`process.env.${k}`] = JSON.stringify(process.env[k]);
}

const distDir = __dirname + '/../packages/functions/dist';

try {
    fs.rmdirSync(distDir);
} catch (ignore) {}

const options = {
    entryPoints: traverse(__dirname + '/../packages/functions/lib').files,
    bundle: false,
    outdir: distDir,
    format: 'cjs',
    target: ['node12.19.0'],
    define,
};

buildSync(options);
fs.rmdirSync(__dirname + '/../packages/functions/lib', { recursive: true });
fs.renameSync(__dirname + '/../packages/functions/dist', __dirname + '/../packages/functions/lib');
