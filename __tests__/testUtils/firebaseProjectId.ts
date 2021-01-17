import fs from 'fs';
const firebaseRc = JSON.parse(fs.readFileSync(__dirname + '/../../.firebaserc', 'utf8'));

export const firebaseProjectId: string = firebaseRc.projects.production;
