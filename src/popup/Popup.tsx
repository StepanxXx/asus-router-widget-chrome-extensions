import { useState } from 'react';
import contentScriptFile from '../content/index.ts?script&iife';
import type { ExtensionResponse, Feature, OpenFeatureMessage } from '../shared/messages';

type ScriptButton = {
  name: Feature;
};

const buttonScripts: ScriptButton[] = [
  { name: 'clients' },
  { name: 'networks' },
];

async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.id === undefined) {
    throw new Error('Active tab was not found');
  }

  return tab.id;
}

async function openFeature(feature: Feature): Promise<void> {
  const tabId = await getActiveTabId();

  await chrome.scripting.executeScript({
    target: { tabId },
    files: [contentScriptFile],
  });

  const message: OpenFeatureMessage = { type: 'open-feature', feature };
  const response = await chrome.tabs.sendMessage<OpenFeatureMessage, ExtensionResponse>(tabId, message);

  if (!response.ok) throw new Error(response.error);
}

export function Popup() {
  const [pendingFeature, setPendingFeature] = useState<Feature | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(feature: Feature) {
    setPendingFeature(feature);
    setError(null);

    try {
      await openFeature(feature);
      window.close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to open router widget');
      setPendingFeature(null);
    }
  }

  return (
    <main>
      <div className="btn-group">
        {buttonScripts.map(({ name }) => (
          <button
            key={name}
            type="button"
            disabled={pendingFeature !== null}
            onClick={() => void handleClick(name)}
          >
            {pendingFeature === name ? `${name}…` : name}
          </button>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
