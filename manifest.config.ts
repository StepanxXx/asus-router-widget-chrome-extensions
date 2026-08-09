import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  name: 'Asus router widget',
  version: '1.0.0',
  description: 'Asus router widget',
  manifest_version: 3,
  permissions: ['activeTab', 'scripting'],
  action: {
    default_popup: 'popup.html',
    default_icon: {
      16: 'images/icon-16.png',
      128: 'images/icon-128.png',
    },
  },
  icons: {
    16: 'images/icon-16.png',
    128: 'images/icon-128.png',
  },
});
