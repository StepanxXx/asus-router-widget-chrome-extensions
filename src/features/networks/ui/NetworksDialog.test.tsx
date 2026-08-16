// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NetworkTrafficState } from '../model/types';
import { NetworksView } from './NetworksDialog';

const mocks = vi.hoisted(() => ({ useNetworkTraffic: vi.fn() }));

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

describe('NetworksView', () => {
  beforeEach(() => mocks.useNetworkTraffic.mockReset());
  afterEach(cleanup);

  it('renders the loading state', () => {
    mocks.useNetworkTraffic.mockReturnValue({ isPending: true, isError: false } as never);
    render(<NetworksView />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders a controlled error state', () => {
    mocks.useNetworkTraffic.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error('Router is unavailable'),
    } as never);
    render(<NetworksView />);
    expect(screen.getByText('Router is unavailable')).toHaveClass('networks-status--error');
  });

  it('renders network data as a card', () => {
    mocks.useNetworkTraffic.mockReturnValue({
      isPending: false,
      isError: false,
      data: networkState,
    } as never);
    render(<NetworksView />);

    expect(screen.getByText('INTERNET')).toBeInTheDocument();
    expect(screen.getByText('Total 1 MB')).toBeInTheDocument();
    expect(screen.getByText('Traffic peak')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'INTERNET traffic history' })).toBeInTheDocument();
  });

  it('renders an empty state when no configured interfaces are available', () => {
    mocks.useNetworkTraffic.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...networkState, interfaces: {} },
    } as never);
    render(<NetworksView />);
    expect(screen.getByText('No network data found.')).toBeInTheDocument();
  });
});
