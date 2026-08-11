import { useEffect, useRef, useState } from 'preact/hooks';
import { ClientsView } from '../../clients/ui/ClientsDialog';
import { NetworksView } from '../../networks/ui/NetworksDialog';
import { DialogNavigation, type DialogView } from './DialogNavigation';
import type { Feature } from '../../../shared/messages';

type DialogRouterProps = {
  initialView: DialogView;
  onClose: () => void;
};

export function DialogRouter({ initialView, onClose }: DialogRouterProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState(initialView);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const title =
    view === 'menu'
      ? 'Asus router widget'
      : view === 'clients'
        ? 'Clients'
        : 'Network total / speed';

  const navigate = (nextView: Feature) => setView(nextView);

  return (
    <dialog ref={dialogRef} className={`dialog-modal dialog-modal--${view}`} onClose={onClose}>
      <header className="dialog-header">
        <h2>{title}</h2>
        {view !== 'menu' && <DialogNavigation activeView={view} onNavigate={navigate} />}
        <button
          className="dialog-close"
          type="button"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>
      </header>
      {view === 'menu' && (
        <div className="dialog-menu">
          <p>Choose the information you want to view:</p>
          <div className="dialog-menu-actions">
            <button type="button" onClick={() => navigate('clients')}>
              <strong>Clients</strong>
              <span>Connected devices and their traffic</span>
            </button>
            <button type="button" onClick={() => navigate('networks')}>
              <strong>Networks</strong>
              <span>Total traffic and network speed</span>
            </button>
          </div>
        </div>
      )}
      {view === 'clients' && <ClientsView />}
      {view === 'networks' && <NetworksView />}
    </dialog>
  );
}
