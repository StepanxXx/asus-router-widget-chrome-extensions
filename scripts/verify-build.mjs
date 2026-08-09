import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const contentScriptPath = resolve('dist/src/content/index.js');
const contentScript = await readFile(contentScriptPath, 'utf8');

if (contentScript.includes('process.env')) {
  throw new Error(`Node-only process.env reference found in ${contentScriptPath}`);
}

console.log('Browser bundle verification passed.');
