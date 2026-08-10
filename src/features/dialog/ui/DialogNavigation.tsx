import type { Feature } from '../../../shared/messages';

export type DialogView = 'menu' | Feature;

type DialogNavigationProps = {
  activeView: Feature;
  onNavigate: (view: Feature) => void;
};

export function DialogNavigation({ activeView, onNavigate }: DialogNavigationProps) {
  return (
    <nav className="dialog-navigation" aria-label="Dialog navigation">
      {(['clients', 'networks'] as const).map((view) => {
        const isActive = view === activeView;

        return (
          <button
            key={view}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            disabled={isActive}
            onClick={() => onNavigate(view)}
          >
            {view === 'clients' ? 'Clients' : 'Networks'}
          </button>
        );
      })}
    </nav>
  );
}
