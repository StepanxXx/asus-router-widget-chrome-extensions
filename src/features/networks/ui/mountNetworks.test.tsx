// @vitest-environment jsdom

import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountNetworks, unmountNetworks } from './mountNetworks';

const mocks = vi.hoisted(() => ({
  fetchNetworkSnapshot: vi.fn(),
}));

vi.mock('../api/networkApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/networkApi')>()),
  fetchNetworkSnapshot: mocks.fetchNetworkSnapshot,
}));

describe('Networks mount lifecycle', () => {
  afterEach(() => {
    unmountNetworks();
    mocks.fetchNetworkSnapshot.mockReset();
  });

  it('aborts the active query when unmounted', async () => {
    let requestSignal: AbortSignal | undefined;
    mocks.fetchNetworkSnapshot.mockImplementation((_origin: string, signal?: AbortSignal) => {
      requestSignal = signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });

    act(() => mountNetworks());
    await waitFor(() => expect(mocks.fetchNetworkSnapshot).toHaveBeenCalledOnce());

    act(() => unmountNetworks());

    expect(requestSignal?.aborted).toBe(true);
    expect(document.getElementById('asus-router-networks-root')).not.toBeInTheDocument();
  });
});
