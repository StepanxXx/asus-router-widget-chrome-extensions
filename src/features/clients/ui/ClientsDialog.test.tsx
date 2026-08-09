// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClientTrafficState } from '../model/types';
import { ClientsDialog } from './ClientsDialog';

const mocks = vi.hoisted(() => ({
  useClientsTraffic: vi.fn(),
}));

vi.mock('../hooks/useClientsTraffic', () => ({
  useClientsTraffic: mocks.useClientsTraffic,
}));

const clientsState: ClientTrafficState = {
  stamp: 2000,
  max: 200,
  min: 0,
  counters: {
    offline: { inc: 0, out: 0 },
    online: { inc: 200, out: 100 },
  },
  history: {
    offline: [],
    online: [{ inc: 200, out: 100, stamp: 2000 }],
  },
  clients: {
    offline: {
      name: 'Printer',
      isOnline: '0',
      isLogin: '0',
      isWL: '0',
      inc: 0,
      out: 0,
      speedInc: 0,
      speedOut: 0,
      log: [],
    },
    online: {
      name: '<img src=x onerror=alert(1)>',
      isOnline: '1',
      isLogin: '1',
      isWL: '2',
      rssi: '-55',
      inc: 200,
      out: 100,
      speedInc: 200,
      speedOut: 100,
      log: [{ inc: 200, out: 100, stamp: 2000 }],
    },
  },
};

describe('ClientsDialog', () => {
  beforeEach(() => {
    mocks.useClientsTraffic.mockReset();
  });

  afterEach(cleanup);

  it('renders loading, empty and error states', () => {
    mocks.useClientsTraffic.mockReturnValue({ isPending: true, isError: false } as never);
    const view = render(<ClientsDialog onClose={vi.fn()} />);
    expect(screen.getByText('Loading clients…')).toBeInTheDocument();

    mocks.useClientsTraffic.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...clientsState, clients: {} },
    } as never);
    view.rerender(<ClientsDialog onClose={vi.fn()} />);
    expect(screen.getByText('No clients found.')).toBeInTheDocument();

    mocks.useClientsTraffic.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error('Invalid client response'),
    } as never);
    view.rerender(<ClientsDialog onClose={vi.fn()} />);
    expect(screen.getByText('Invalid client response')).toHaveClass('clients-status--error');
  });

  it('sorts active clients first and renders router values as text', () => {
    mocks.useClientsTraffic.mockReturnValue({
      isPending: false,
      isError: false,
      data: clientsState,
    } as never);

    const { container } = render(<ClientsDialog onClose={vi.fn()} />);
    const names = Array.from(container.querySelectorAll('.clients-card-name')).map(
      (element) => element.textContent,
    );

    expect(names).toEqual(['<img src=x onerror=alert(1)>', 'Printer']);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: 'Client traffic history' })).toHaveLength(2);
  });

  it('notifies the mount layer when closed', () => {
    const onClose = vi.fn();
    mocks.useClientsTraffic.mockReturnValue({ isPending: true, isError: false } as never);

    render(<ClientsDialog onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
