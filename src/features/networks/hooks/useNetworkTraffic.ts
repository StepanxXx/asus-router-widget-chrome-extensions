import { useCallback, useRef } from 'preact/hooks';
import { usePollingQuery } from '../../../shared/usePollingQuery';
import { fetchNetworkSnapshot } from '../api/networkApi';
import { networkTypes } from '../model/networkConfig';
import { transformNetworkData } from '../model/transformNetworkData';
import type { NetworkTrafficState } from '../model/types';

export function useNetworkTraffic() {
  const previousStateRef = useRef<NetworkTrafficState | null>(null);

  const query = useCallback(async (signal: AbortSignal) => {
    const snapshot = await fetchNetworkSnapshot(window.location.origin, signal);
    const nextState = transformNetworkData(snapshot, previousStateRef.current, networkTypes);
    previousStateRef.current = nextState;
    return nextState;
  }, []);

  return usePollingQuery({
    interval: 2000,
    query,
    retry: 1,
  });
}
