import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot, type Root } from 'react-dom/client';
import { ShadowRoot } from '../../../components/ShadowRoot/ShadowRoot';
import clientsStyles from '../../clients/ui/clients.css?inline';
import networksStyles from '../../networks/ui/networks.css?inline';
import navigationStyles from './dialog.css?inline';
import { DialogRouter } from './DialogRouter';
import type { DialogView } from './DialogNavigation';

type MountedDialog = {
  container: HTMLElement;
  root: Root;
  queryClient: QueryClient;
};

let mountedDialog: MountedDialog | null = null;

export function unmountDialog(): void {
  if (!mountedDialog) return;

  const mounted = mountedDialog;
  mountedDialog = null;
  mounted.root.unmount();
  mounted.queryClient.clear();
  mounted.container.remove();
}

export function mountDialog(initialView: DialogView): void {
  unmountDialog();

  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = createRoot(container);
  const queryClient = new QueryClient();
  mountedDialog = { container, root, queryClient };

  root.render(
    <ShadowRoot
      id="asus-router-dialog-root"
      css={`
        ${clientsStyles}\n${networksStyles}\n${navigationStyles}
      `}
    >
      <QueryClientProvider client={queryClient}>
        <DialogRouter initialView={initialView} onClose={() => queueMicrotask(unmountDialog)} />
      </QueryClientProvider>
    </ShadowRoot>,
  );
}
