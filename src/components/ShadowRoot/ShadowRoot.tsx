import {
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type ShadowRootProps = PropsWithChildren<
  { css?: string } & Omit<ComponentPropsWithoutRef<'div'>, 'children'>
>;

export function ShadowRoot({ children, css, ...hostProps }: ShadowRootProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });

    setRoot(shadow);
  }, []);

  return (
    <div {...hostProps} ref={hostRef}>
      {root &&
        createPortal(
          <>
            {css && <style>{css}</style>}
            {children}
          </>,
          root,
        )}
    </div>
  );
}
