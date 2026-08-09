import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot, type Root } from 'react-dom/client';
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
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  const appRoot = document.createElement('div');
  style.textContent = styles;
  shadowRoot.append(style, appRoot);
  document.body.appendChild(host);

  const root = createRoot(appRoot);
  const queryClient = new QueryClient();
  mountedClients = { host, root, queryClient };

  root.render(
    <QueryClientProvider client={queryClient}>
      <ClientsDialog onClose={() => queueMicrotask(unmountClients)} />
    </QueryClientProvider>,
  );
}
