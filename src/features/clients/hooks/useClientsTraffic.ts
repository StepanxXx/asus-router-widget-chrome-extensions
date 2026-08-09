import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchClients, fetchClientTraffic } from '../api/clientsApi';
import { transformClientData } from '../model/transformClientData';
import type { ClientTrafficState } from '../model/types';

export function useClientsTraffic() {
  const previousState = useRef<ClientTrafficState | null>(null);

  return useQuery({
    queryKey: ['clients-traffic', window.location.origin],
    queryFn: async ({ signal }) => {
      const [clients, traffic] = await Promise.all([
        fetchClients(window.location.origin, signal),
        fetchClientTraffic(window.location.origin, signal),
      ]);
      const nextState = transformClientData(clients, traffic, previousState.current);
      previousState.current = nextState;
      return nextState;
    },
    refetchInterval: 2000,
    retry: 1,
  });
}
