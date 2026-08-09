export type Feature = 'clients' | 'networks';

export type OpenFeatureMessage = {
  type: 'open-feature';
  feature: Feature;
};

export type ExtensionMessage = OpenFeatureMessage;

export type ExtensionResponse = { ok: true } | { ok: false; error: string };

export function isOpenFeatureMessage(message: unknown): message is OpenFeatureMessage {
  if (!message || typeof message !== 'object') return false;

  const candidate = message as Partial<OpenFeatureMessage>;
  return (
    candidate.type === 'open-feature' &&
    (candidate.feature === 'clients' || candidate.feature === 'networks')
  );
}
