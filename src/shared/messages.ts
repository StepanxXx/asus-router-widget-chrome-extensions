export type Feature = 'clients' | 'networks';

export type OpenDialogMessage = {
  type: 'open-dialog';
  initialView?: Feature;
};

export type ExtensionResponse = { ok: true } | { ok: false; error: string };

export function isOpenDialogMessage(message: unknown): message is OpenDialogMessage {
  if (!message || typeof message !== 'object') return false;

  const candidate = message as Partial<OpenDialogMessage>;
  return (
    candidate.type === 'open-dialog' &&
    (candidate.initialView === undefined ||
      candidate.initialView === 'clients' ||
      candidate.initialView === 'networks')
  );
}
