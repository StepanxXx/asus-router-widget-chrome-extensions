import { type PropsWithChildren, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ShadowRootProps extends PropsWithChildren {
  css?: string;
}

export function ShadowRoot({ children, css }: ShadowRootProps) {
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
    <div ref={hostRef}>
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
