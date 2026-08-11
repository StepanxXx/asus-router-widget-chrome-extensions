import { useCallback, useRef } from 'react';
import { usePollingQuery } from '../../../shared/usePollingQuery';
import { fetchNetworkSnapshot } from '../api/networkApi';
import { networkTypes } from '../model/networkConfig';
import { transformNetworkData } from '../model/transformNetworkData';
import type { NetworkTrafficState } from '../model/types';

export function useNetworkTraffic() {
  const previousState = useRef<NetworkTrafficState | null>(null);

  const query = useCallback(async (signal: AbortSignal) => {
    const snapshot = await fetchNetworkSnapshot(window.location.origin, signal);
    const nextState = transformNetworkData(snapshot, previousState.current, networkTypes);
    previousState.current = nextState;
    return nextState;
  }, []);

  return usePollingQuery({
    interval: 2000,
    query,
    retry: 1,
  });
}
