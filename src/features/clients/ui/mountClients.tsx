import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot, type Root } from 'react-dom/client';
import { ShadowRoot } from '../../../components/ShadowRoot/ShadowRoot';
import styles from './clients.css?inline';
import { ClientsDialog } from './ClientsDialog';

type MountedClients = {
  host: HTMLElement;
  root: Root;
  queryClient: QueryClient;
};

let mountedClients: MountedClients | null = null;

export function unmountClients(): void {
  if (!mountedClients) return;

  const mounted = mountedClients;
  mountedClients = null;
  mounted.root.unmount();
  mounted.queryClient.clear();
  mounted.host.remove();
}

export function mountClients(): void {
  unmountClients();

  const host = document.createElement('div');
  host.id = 'asus-router-clients-root';
  document.body.appendChild(host);

  const root = createRoot(host);
  const queryClient = new QueryClient();
  mountedClients = { host, root, queryClient };

  root.render(
    <ShadowRoot css={styles}>
      <QueryClientProvider client={queryClient}>
        <ClientsDialog onClose={() => queueMicrotask(unmountClients)} />
      </QueryClientProvider>
    </ShadowRoot>,
  );
}
