import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { crx } from '@crxjs/vite-plugin';
import { defineConfig, type Plugin } from 'vite';
import manifest from './manifest.config.ts';

const legacyRuntimeFiles = [
  'src/Diagram.js',
  'src/bootstrap.css',
  'src/extensionHelpers.js',
  'src/modules/clients/controller/clientsController.js',
  'src/modules/clients/data/clientDataStore.js',
  'src/modules/clients/styles/clients.css',
  'src/modules/clients/styles/clientsStyles.js',
  'src/modules/clients/templates/clientsTemplates.js',
  'src/modules/clients/ui/clientsUi.js',
  'src/modules/networks/controller/networksController.js',
  'src/modules/networks/data/networkDataStore.js',
  'src/modules/networks/styles/networks.css',
  'src/modules/networks/styles/networksStyles.js',
  'src/modules/networks/ui/networksUi.js',
];

function copyLegacyRuntime(): Plugin {
  return {
    name: 'copy-legacy-runtime',
    apply: 'build',
    async closeBundle() {
      const outputDirectory = resolve(import.meta.dirname, 'dist');

      await mkdir(outputDirectory, { recursive: true });
      await Promise.all([
        ...legacyRuntimeFiles.map(async (file) => {
          const destination = resolve(outputDirectory, file);
          await mkdir(dirname(destination), { recursive: true });
          await cp(resolve(import.meta.dirname, file), destination);
        }),
        cp(resolve(import.meta.dirname, 'images'), resolve(outputDirectory, 'images'), {
          recursive: true,
        }),
      ]);
    },
  };
}

export default defineConfig({
  plugins: [crx({ manifest }), copyLegacyRuntime()],
});
