import { createContext, type ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';

interface SidebarContextValue {
  isCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
});

export const useSidebar = () => useContext(SidebarContext);

export interface SidebarLayoutProps {
  isCollapsed?: boolean;
  onToggle?: (event: MouseEvent) => void;
  title?: string;
  header?: ComponentChildren;
  footer?: ComponentChildren;
  children?: ComponentChildren;
}

export function SidebarLayout({
  isCollapsed = false,
  onToggle,
  title = 'My App',
  header,
  footer,
  children,
}: SidebarLayoutProps) {
  return (
    <SidebarContext.Provider value={{ isCollapsed }}>
      <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : 'sidebar--expanded'}`}>
        <div className="sidebar-header">
          {header ? (
            header
          ) : (
            <a className="sidebar-brand" href="#" onClick={(e) => { e.preventDefault(); onToggle?.(e) }}>
              <span
                className="brand-logo"
                title={isCollapsed ? 'Show menu' : 'Hide menu'}
                aria-label={isCollapsed ? 'Show menu' : 'Hide menu'}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </span>
              <span className="brand-name">{title}</span>
            </a>
          )}
        </div>

        <div className="sidebar-nav-container">{children}</div>

        <div className="sidebar-footer">
          {footer ? (
            footer
          ) : (
            <button
              type="button"
              className="collapse-btn"
              onClick={onToggle}
              title={isCollapsed ? 'Show menu' : 'Hide menu'}
              aria-label={isCollapsed ? 'Show menu' : 'Hide menu'}
            >
              <svg
                className={`collapse-icon ${isCollapsed ? 'rotated' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="collapse-text">Hide</span>
            </button>
          )}
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}

export interface SidebarNavProps {
  children?: ComponentChildren;
}

export function SidebarNav({ children }: SidebarNavProps) {
  return <ul className="sidebar-nav">{children}</ul>;
}

export interface SidebarItemProps {
  icon: ComponentChildren;
  label?: string;
  href?: string;
  badge?: string;
  isActive?: boolean;
  onClick?: (e: MouseEvent) => void;
}

export function SidebarItem({
  icon,
  label,
  href = '#',
  badge,
  isActive = false,
  onClick,
}: SidebarItemProps) {
  const { isCollapsed } = useSidebar();

  const visibleClass = isCollapsed ? 'visually-hidden' : '';

  return (
    <li className="sidebar-nav-item">
      <a
        href={href}
        className={`nav-link ${isActive ? 'active' : ''}`}
        onClick={onClick}
        title={isCollapsed ? label : undefined}
      >
        <span className="nav-icon">{icon}</span>
        {label && <span className={`nav-label ${visibleClass}`}>{label}</span>}
        {badge && <span className={`nav-badge ${visibleClass}`}>{badge}</span>}
      </a>
    </li>
  );
}

export interface SidebarContentProps {
  isHidden?: boolean;
  children?: ComponentChildren;
}

export function SidebarContent({ children, isHidden = false }: SidebarContentProps) {
  const classHidden = isHidden ? 'visually-hidden' : '';
  return <div className={`sidebar-content ${classHidden}`}>{children}</div>;
}

export interface SidebarContainerProps {
  children?: ComponentChildren;
}

export function SidebarContainer({ children }: SidebarContainerProps) {
  return (
    <div className="sidebar-container" role="dialog" aria-label="Asus router widget">
      {children}
    </div>
  );
}
