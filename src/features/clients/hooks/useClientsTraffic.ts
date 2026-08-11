import { useCallback, useRef } from 'react';
import { usePollingQuery } from '../../../shared/usePollingQuery';
import { fetchClients, fetchClientTraffic } from '../api/clientsApi';
import { transformClientData } from '../model/transformClientData';
import type { ClientTrafficState } from '../model/types';

export function useClientsTraffic() {
  const previousState = useRef<ClientTrafficState | null>(null);

  const query = useCallback(async (signal: AbortSignal) => {
    const [clients, traffic] = await Promise.all([
      fetchClients(window.location.origin, signal),
      fetchClientTraffic(window.location.origin, signal),
    ]);
    const nextState = transformClientData(clients, traffic, previousState.current);
    previousState.current = nextState;
    return nextState;
  }, []);

  return usePollingQuery({
    interval: 2000,
    query,
    retry: 1,
  });
}
