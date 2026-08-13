import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const contentScriptPath = resolve('dist/src/content/index.js');
const contentScript = await readFile(contentScriptPath);
const bytesPerKilobyte = 1024;
const maxGzipKilobytes = 15;
const rawKilobytes = contentScript.byteLength / bytesPerKilobyte;
const gzipKilobytes = gzipSync(contentScript).byteLength / bytesPerKilobyte;

console.log(
  `Content bundle: ${rawKilobytes.toFixed(2)} KB raw / ${gzipKilobytes.toFixed(2)} KB gzip`,
);

if (contentScript.includes('process.env')) {
  throw new Error(`Node-only process.env reference found in ${contentScriptPath}`);
}

if (gzipKilobytes > maxGzipKilobytes) {
  console.warn(
    `Warning: content bundle exceeds the ${maxGzipKilobytes} KB gzip threshold: ${gzipKilobytes.toFixed(2)} KB`,
  );
}

console.log('Browser bundle verification passed.');
