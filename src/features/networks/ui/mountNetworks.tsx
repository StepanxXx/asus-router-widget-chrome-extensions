import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot, type Root } from 'react-dom/client';
import { ShadowRoot } from '../../../components/ShadowRoot/ShadowRoot';
import { mountClients } from '../../clients/ui/mountClients';
import styles from './networks.css?inline';
import { NetworksDialog } from './NetworksDialog';

type MountedNetworks = {
  host: HTMLElement;
  root: Root;
  queryClient: QueryClient;
};

let mountedNetworks: MountedNetworks | null = null;

export function unmountNetworks(): void {
  if (!mountedNetworks) return;

  const mounted = mountedNetworks;
  mountedNetworks = null;
  mounted.root.unmount();
  mounted.queryClient.clear();
  mounted.host.remove();
}

export function mountNetworks(): void {
  unmountNetworks();

  const host = document.createElement('div');
  host.id = 'asus-router-networks-root';
  document.body.appendChild(host);

  const root = createRoot(host);
  const queryClient = new QueryClient();
  mountedNetworks = { host, root, queryClient };

  root.render(
    <ShadowRoot css={styles}>
      <QueryClientProvider client={queryClient}>
        <NetworksDialog
          onClose={() => queueMicrotask(unmountNetworks)}
          onShowClients={() =>
            queueMicrotask(() => {
              unmountNetworks();
              mountClients();
            })
          }
        />
      </QueryClientProvider>
    </ShadowRoot>,
  );
}
