import { useEffect, useRef, useState } from 'preact/hooks';
import { ClientsView } from '../../clients/ui/ClientsDialog';
import { NetworksView } from '../../networks/ui/NetworksDialog';
import { DialogNavigation, type DialogView } from './DialogNavigation';
import type { Feature } from '../../../shared/messages';
import {
  SidebarContainer,
  SidebarLayout,
  SidebarNav,
  SidebarItem,
  SidebarContent,
} from '../../../components/SidebarLayout/SidebarLayout';
import { VNode } from 'preact';

type DialogRouterProps = {
  initialView: DialogView;
  onClose: () => void;
};

type viewMapType = Record<DialogView, string>;

const viewMap: viewMapType = {
  menu: 'Home',
  clients: 'Clients',
  networks: 'Networks',
};

type iconMapType = Record<DialogView, () => VNode>;

const iconMap: iconMapType = {
  menu: () => (
    <svg
      className="icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  clients: () => (
    <svg
      className="icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  networks: () => (
    <svg
      className="icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
};

export function DialogRouter({ initialView, onClose }: DialogRouterProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<DialogView>(initialView);

  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = (e: MouseEvent | HTMLButtonElement) => {
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const title = {
    menu: 'Asus router widget',
    clients: 'Clients',
    networks: 'Network total / speed',
  }[view];

  const navigate = (nextView: Feature) => setView(nextView);

  return (
    <SidebarContainer>
      <SidebarLayout isCollapsed={isCollapsed} onToggle={toggleSidebar} title="Asus router widget">
        <SidebarNav>
          {(Object.entries(viewMap) as [DialogView, string][]).map(([key, value]) => (
            <SidebarItem
              key={key}
              icon={iconMap[key]()}
              label={value}
              href="/"
              isActive={view === key}
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                setView(key);
              }}
            />
          ))}
        </SidebarNav>
      </SidebarLayout>
      <SidebarContent isHidden={view === 'menu'}>
        <header className="dialog-header">
          <h2>{title}</h2>
          <button
            className="dialog-close"
            type="button"
            aria-label="Close"
            onClick={() => setView('menu')}
          >
            ×
          </button>
        </header>
        {view === 'clients' && <ClientsView />}
        {view === 'networks' && <NetworksView />}
      </SidebarContent>
    </SidebarContainer>
    // <dialog ref={dialogRef} className={`dialog-modal dialog-modal--${view}`} onClose={onClose}>
    //   <header className="dialog-header">
    //     <h2>{title}</h2>
    //     {view !== 'menu' && <DialogNavigation activeView={view} onNavigate={navigate} />}
    //     <button
    //       className="dialog-close"
    //       type="button"
    //       aria-label="Close"
    //       onClick={() => dialogRef.current?.close()}
    //     >
    //       ×
    //     </button>
    //   </header>
    //   {view === 'menu' && (
    //     <div className="dialog-menu">
    //       <p>Choose the information you want to view:</p>
    //       <div className="dialog-menu-actions">
    //         <button type="button" onClick={() => navigate('clients')}>
    //           <strong>Clients</strong>
    //           <span>Connected devices and their traffic</span>
    //         </button>
    //         <button type="button" onClick={() => navigate('networks')}>
    //           <strong>Networks</strong>
    //           <span>Total traffic and network speed</span>
    //         </button>
    //       </div>
    //     </div>
    //   )}
    //   {view === 'clients' && <ClientsView />}
    //   {view === 'networks' && <NetworksView />}
    // </dialog>
  );
}
