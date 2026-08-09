import { useState } from 'react';

type ScriptButton = {
  name: string;
  file: string;
};

const buttonScripts: ScriptButton[] = [
  { name: 'clients', file: 'src/modules/clients/controller/clientsController.js' },
  { name: 'networks', file: 'src/modules/networks/controller/networksController.js' },
];

const globalScripts = [
  { file: 'src/Diagram.js', globalName: 'Diagram' },
  { file: 'src/extensionHelpers.js', globalName: 'AsusRouterHelpers' },
  { file: 'src/modules/clients/data/clientDataStore.js', globalName: 'AsusRouterClientData' },
  {
    file: 'src/modules/clients/templates/clientsTemplates.js',
    globalName: 'AsusRouterClientsTemplates',
  },
  { file: 'src/modules/clients/styles/clientsStyles.js', globalName: 'AsusRouterClientsStyles' },
  { file: 'src/modules/clients/ui/clientsUi.js', globalName: 'AsusRouterClientsUi' },
  { file: 'src/modules/networks/data/networkDataStore.js', globalName: 'AsusRouterNetworksData' },
  {
    file: 'src/modules/networks/styles/networksStyles.js',
    globalName: 'AsusRouterNetworksStyles',
  },
  { file: 'src/modules/networks/ui/networksUi.js', globalName: 'AsusRouterNetworksUi' },
];

const styleFiles = [
  'src/bootstrap.css',
  'src/modules/clients/styles/clients.css',
  'src/modules/networks/styles/networks.css',
];

async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.id === undefined) {
    throw new Error('Active tab was not found');
  }

  return tab.id;
}

async function ensureGlobalScript(tabId: number, file: string, globalName: string): Promise<void> {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: (name) => typeof (globalThis as Record<string, unknown>)[name] !== 'undefined',
    args: [globalName],
  });

  if (results[0]?.result) return;

  await chrome.scripting.executeScript({
    target: { tabId },
    files: [file],
  });
}

async function runFeatureScript(script: string): Promise<void> {
  const tabId = await getActiveTabId();

  await chrome.scripting.insertCSS({
    target: { tabId },
    files: styleFiles,
  });

  for (const { file, globalName } of globalScripts) {
    await ensureGlobalScript(tabId, file, globalName);
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    files: [script],
  });
}

export function Popup() {
  const [pendingScript, setPendingScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(script: string) {
    setPendingScript(script);
    setError(null);

    try {
      await runFeatureScript(script);
      window.close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to open router widget');
      setPendingScript(null);
    }
  }

  return (
    <main>
      <div className="btn-group">
        {buttonScripts.map(({ name, file }) => (
          <button
            key={name}
            type="button"
            disabled={pendingScript !== null}
            onClick={() => void handleClick(file)}
          >
            {pendingScript === file ? `${name}…` : name}
          </button>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
