// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DialogRouter } from './DialogRouter';

vi.mock('../../clients/ui/ClientsDialog', () => ({
  ClientsView: () => <div>Clients view</div>,
}));

vi.mock('../../networks/ui/NetworksDialog', () => ({
  NetworksView: () => <div>Networks view</div>,
}));

describe('DialogRouter', () => {
  afterEach(cleanup);

  it('opens with a feature selection menu', () => {
    render(<DialogRouter initialView="menu" onClose={vi.fn()} />);

    expect(screen.getByText('Choose the information you want to view:')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Clients/ }));
    expect(screen.getByText('Clients view')).toBeInTheDocument();
  });

  it('switches views without remounting the application root', () => {
    render(<DialogRouter initialView="clients" onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(screen.getByText('Clients view')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Networks' }));
    expect(screen.getByText('Networks view')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBe(dialog);

    fireEvent.click(screen.getByRole('button', { name: 'Clients' }));
    expect(screen.getByText('Clients view')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBe(dialog);
  });

  it('owns the shared close button', () => {
    const onClose = vi.fn();
    render(<DialogRouter initialView="clients" onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
