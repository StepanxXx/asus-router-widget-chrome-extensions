// @vitest-environment jsdom

import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mountDialog, unmountDialog } from './mountDialog';

const mocks = vi.hoisted(() => ({
  fetchNetworkSnapshot: vi.fn(),
}));

vi.mock('../../networks/api/networkApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../networks/api/networkApi')>()),
  fetchNetworkSnapshot: mocks.fetchNetworkSnapshot,
}));

describe('Dialog mount lifecycle', () => {
  afterEach(() => {
    unmountDialog();
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

    act(() => mountDialog('networks'));
    await waitFor(() => expect(mocks.fetchNetworkSnapshot).toHaveBeenCalledOnce());

    act(() => unmountDialog());

    expect(requestSignal?.aborted).toBe(true);
    expect(document.getElementById('asus-router-dialog-root')).not.toBeInTheDocument();
  });
});
