import type { VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import {
  SidebarContainer,
  SidebarContent,
  SidebarItem,
  SidebarLayout,
  SidebarNav,
} from '../../../components/SidebarLayout/SidebarLayout';
import type { Feature } from '../../../shared/messages';
import { ClientsView } from '../../clients/ui/ClientsDialog';
import { NetworksView } from '../../networks/ui/NetworksDialog';

export type DialogView = 'menu' | Feature;

type DialogRouterProps = {
  initialView: DialogView;
  onClose: () => void;
};

const viewLabels: Record<DialogView, string> = {
  menu: 'Home',
  clients: 'Clients',
  networks: 'Networks',
};

const viewIcons: Record<DialogView | 'close' | 'back', () => VNode> = {
  menu: () => (
    <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  clients: () => (
    <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  networks: () => (
    <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  close: () => (
    <svg
      className="icon-svg close"
      viewBox="0 0 24 24"
      fill="none"
      stroke-linecap="round"
      strok-linejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  back: () => (
    <svg
      className="icon-svg back"
      viewBox="0 0 24 24"
      fill="none"
      stroke-linecap="round"
      strok-linejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  ),
};

export function DialogRouter({ initialView, onClose }: DialogRouterProps) {
  const [view, setView] = useState<DialogView>(initialView);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const title = {
    menu: 'Asus router widget',
    clients: 'Clients',
    networks: 'Network total / speed',
  }[view];

  useEffect(() => {
    const isMenu = view === 'menu';
    const originalStyle = document.body.style.overflow;

    if (!isMenu) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [view]);

  return (
    <SidebarContainer>
      <SidebarLayout
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((collapsed) => !collapsed)}
        title="Asus router widget"
      >
        <SidebarNav>
          {(Object.entries(viewLabels) as Array<[DialogView, string]>).map(([key, label]) => (
            <SidebarItem
              key={key}
              icon={viewIcons[key]()}
              label={label}
              isActive={view === key}
              onClick={(event) => {
                event.preventDefault();
                setView(key);
              }}
            />
          ))}
          <SidebarItem
            icon={viewIcons['close']()}
            label="Close"
            isActive={false}
            onClick={(event) => {
              event.preventDefault();
              onClose();
            }}
          />
        </SidebarNav>
      </SidebarLayout>
      <SidebarContent isHidden={view === 'menu'}>
        <header className="dialog-header">
          <h2>{title}</h2>
          <button
            className="dialog-close"
            type="button"
            aria-label="Back to home"
            onClick={() => setView('menu')}
          >
            {viewIcons['back']()}
          </button>
        </header>
        {view === 'clients' && <ClientsView />}
        {view === 'networks' && <NetworksView />}
      </SidebarContent>
    </SidebarContainer>
  );
}
