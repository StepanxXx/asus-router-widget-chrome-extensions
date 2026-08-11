import { useEffect, useState } from 'preact/hooks';

type PollingQueryState<T> =
  | { data: undefined; error: null; isError: false; isPending: true }
  | { data: T; error: null; isError: false; isPending: false }
  | { data: T | undefined; error: Error; isError: true; isPending: false };

type PollingQueryOptions<T> = {
  interval: number;
  query: (signal: AbortSignal) => Promise<T>;
  retry?: number;
};

export function usePollingQuery<T>({
  interval,
  query,
  retry = 0,
}: PollingQueryOptions<T>): PollingQueryState<T> {
  const [state, setState] = useState<PollingQueryState<T>>({
    data: undefined,
    error: null,
    isError: false,
    isPending: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      let attempts = 0;

      while (!controller.signal.aborted) {
        try {
          const data = await query(controller.signal);
          if (controller.signal.aborted) return;
          setState({ data, error: null, isError: false, isPending: false });
          break;
        } catch (cause) {
          if (controller.signal.aborted) return;
          if (attempts++ < retry) continue;

          const error = cause instanceof Error ? cause : new Error(String(cause));
          setState((current) => ({
            data: current.data,
            error,
            isError: true,
            isPending: false,
          }));
          break;
        }
      }

      if (!controller.signal.aborted) timeout = setTimeout(poll, interval);
    };

    void poll();

    return () => {
      controller.abort();
      if (timeout) clearTimeout(timeout);
    };
  }, [interval, query, retry]);

  return state;
}
