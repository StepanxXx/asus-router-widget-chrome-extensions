import { useCallback, useRef } from 'preact/hooks';
import { usePollingQuery } from '../../../shared/usePollingQuery';
import { fetchClients, fetchClientTraffic } from '../api/clientsApi';
import { transformClientData } from '../model/transformClientData';
import type { ClientTrafficState } from '../model/types';

export function useClientsTraffic() {
  const previousStateRef = useRef<ClientTrafficState | null>(null);

  const query = useCallback(async (signal: AbortSignal) => {
    const [clients, traffic] = await Promise.all([
      fetchClients(window.location.origin, signal),
      fetchClientTraffic(window.location.origin, signal),
    ]);
    const nextState = transformClientData(clients, traffic, previousStateRef.current);
    previousStateRef.current = nextState;
    return nextState;
  }, []);

  return usePollingQuery({
    interval: 2000,
    query,
    retry: 1,
  });
}
