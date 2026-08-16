// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClientTrafficState } from '../model/types';
import { ClientsView } from './ClientsDialog';

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

describe('ClientsView', () => {
  beforeEach(() => {
    mocks.useClientsTraffic.mockReset();
  });

  afterEach(cleanup);

  it('renders loading, empty and error states', () => {
    mocks.useClientsTraffic.mockReturnValue({ isPending: true, isError: false } as never);
    const view = render(<ClientsView />);
    expect(screen.getByText('Loading clients…')).toBeInTheDocument();

    mocks.useClientsTraffic.mockReturnValue({
      isPending: false,
      isError: false,
      data: { ...clientsState, clients: {} },
    } as never);
    view.rerender(<ClientsView />);
    expect(screen.getByText('No clients found.')).toBeInTheDocument();

    mocks.useClientsTraffic.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error('Invalid client response'),
    } as never);
    view.rerender(<ClientsView />);
    expect(screen.getByText('Invalid client response')).toHaveClass('clients-status--error');
  });

  it('shows online clients by default and can display all clients', () => {
    mocks.useClientsTraffic.mockReturnValue({
      isPending: false,
      isError: false,
      data: clientsState,
    } as never);

    const { container } = render(<ClientsView />);
    expect(screen.getByRole('button', { name: 'Online' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(screen.queryByText('Printer')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'All' }));

    const names = Array.from(container.querySelectorAll('.clients-card-name')).map(
      (element) => element.textContent,
    );

    expect(names).toEqual(['<img src=x onerror=alert(1)>', 'Printer']);
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: 'Client traffic history' })).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Strong: 4 of 4' })).toBeInTheDocument();
    expect(screen.getAllByLabelText('download')).toHaveLength(4);
    expect(screen.getAllByLabelText('upload')).toHaveLength(4);
    expect(screen.getByLabelText('Logged in')).toHaveClass('is-logged-in');
    expect(screen.getByLabelText('Not logged in')).toHaveClass('is-logged-out');
    expect(screen.getAllByLabelText('Current receive rate')).toHaveLength(2);
    expect(screen.getAllByLabelText('Current transmit rate')).toHaveLength(2);
  });

  it('switches between online and offline clients', () => {
    mocks.useClientsTraffic.mockReturnValue({
      isPending: false,
      isError: false,
      data: clientsState,
    } as never);

    render(<ClientsView />);
    fireEvent.click(screen.getByRole('button', { name: 'Offline' }));

    expect(screen.getByText('Printer')).toBeInTheDocument();
    expect(screen.queryByText('<img src=x onerror=alert(1)>')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Offline' })).toHaveAttribute('aria-pressed', 'true');
  });
});
