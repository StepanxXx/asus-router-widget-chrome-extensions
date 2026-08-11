import { render } from 'preact';
import clientsStyles from '../../clients/ui/clients.css?inline';
import networksStyles from '../../networks/ui/networks.css?inline';
import navigationStyles from './dialog.css?inline';
import { DialogRouter } from './DialogRouter';
import type { DialogView } from './DialogNavigation';

type MountedDialog = {
  host: HTMLElement;
  container: HTMLElement;
};

let mountedDialog: MountedDialog | null = null;

export function unmountDialog(): void {
  if (!mountedDialog) return;

  const mounted = mountedDialog;
  mountedDialog = null;
  render(null, mounted.container);
  mounted.host.remove();
}

export function mountDialog(initialView: DialogView): void {
  unmountDialog();

  const host = document.createElement('div');
  host.id = 'asus-router-dialog-root';
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `${clientsStyles}\n${networksStyles}\n${navigationStyles}`;
  shadowRoot.appendChild(style);

  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  mountedDialog = { host, container };

  render(
    <DialogRouter initialView={initialView} onClose={() => queueMicrotask(unmountDialog)} />,
    container,
  );
}
