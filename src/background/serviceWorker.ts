import contentScriptFile from '../content/index.ts?script&iife';
import type { ExtensionResponse, OpenDialogMessage } from '../shared/messages';

async function openDialog(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: [contentScriptFile],
  });

  const message: OpenDialogMessage = { type: 'open-dialog' };
  const response = await chrome.tabs.sendMessage<OpenDialogMessage, ExtensionResponse>(
    tabId,
    message,
  );

  if (!response.ok) throw new Error(response.error);
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined) return;
  const tabId = tab.id;

  void (async () => {
    try {
      await chrome.action.setBadgeText({ tabId, text: '' });
      await openDialog(tabId);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Failed to open router widget';
      await chrome.action.setBadgeBackgroundColor({ tabId, color: '#dc2626' });
      await chrome.action.setBadgeText({ tabId, text: 'ERR' });
      await chrome.action.setTitle({ tabId, title: message });
    }
  })();
});
