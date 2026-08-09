import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNetworkSnapshot } from '../api/networkApi';
import { networkTypes } from '../model/networkConfig';
import { transformNetworkData } from '../model/transformNetworkData';
import type { NetworkTrafficState } from '../model/types';

export function useNetworkTraffic() {
  const previousState = useRef<NetworkTrafficState | null>(null);

  return useQuery({
    queryKey: ['network-traffic', window.location.origin],
    queryFn: async ({ signal }) => {
      const snapshot = await fetchNetworkSnapshot(window.location.origin, signal);
      const nextState = transformNetworkData(snapshot, previousState.current, networkTypes);
      previousState.current = nextState;
      return nextState;
    },
    refetchInterval: 2000,
    retry: 1,
  });
}
