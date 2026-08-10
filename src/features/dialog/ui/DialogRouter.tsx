import { useEffect, useRef, useState } from 'react';
import { ClientsView } from '../../clients/ui/ClientsDialog';
import { NetworksView } from '../../networks/ui/NetworksDialog';
import { DialogNavigation, type DialogView } from './DialogNavigation';

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

  const title = view === 'clients' ? 'Clients' : 'Network total / speed';

  return (
    <dialog ref={dialogRef} className={`dialog-modal dialog-modal--${view}`} onClose={onClose}>
      <header className="dialog-header">
        <h2>{title}</h2>
        <DialogNavigation activeView={view} onNavigate={setView} />
        <button
          className="dialog-close"
          type="button"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>
      </header>
      {view === 'clients' ? <ClientsView /> : <NetworksView />}
    </dialog>
  );
}
