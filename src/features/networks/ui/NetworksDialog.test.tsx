// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NetworkTrafficState } from '../model/types';
import { NetworksDialog } from './NetworksDialog';

const mocks = vi.hoisted(() => ({
  useNetworkTraffic: vi.fn(),
}));

vi.mock('../hooks/useNetworkTraffic', () => ({
  useNetworkTraffic: mocks.useNetworkTraffic,
}));

const networkState: NetworkTrafficState = {
  stamp: 2000,
  max: 300,
  min: 100,
  interfaces: {
    INTERNET0: {
      total: { inc: 1024 * 1024, out: 2 * 1024 * 1024 },
      speed: {
        inc: 100,
        out: 300,
        log: [{ inc: 100, out: 300, stamp: 2000 }],
      },
    },
  },
};

describe('NetworksDialog', () => {
  beforeEach(() => {
    mocks.useNetworkTraffic.mockReset();
  });

  afterEach(cleanup);

  it('renders the loading state', () => {
    mocks.useNetworkTraffic.mockReturnValue({ isPending: true, isError: false } as never);

    render(<NetworksDialog onClose={vi.fn()} />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders a controlled error state', () => {
    mocks.useNetworkTraffic.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error('Router is unavailable'),
    } as never);

    render(<NetworksDialog onClose={vi.fn()} />);

    expect(screen.getByText('Router is unavailable')).toHaveClass('networks-status--error');
  });

  it('renders validated network data and closes the dialog', () => {
    const onClose = vi.fn();
    mocks.useNetworkTraffic.mockReturnValue({
      isPending: false,
      isError: false,
      data: networkState,
    } as never);

    render(<NetworksDialog onClose={onClose} />);

    expect(screen.getByText('INTERNET')).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Network traffic history' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
