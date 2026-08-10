import { mountDialog } from '../features/dialog/ui/mountDialog';
import { isOpenDialogMessage, type ExtensionResponse } from '../shared/messages';

const bridgeState = globalThis as typeof globalThis & {
  __asusRouterContentBridgeInstalled?: boolean;
};

if (!bridgeState.__asusRouterContentBridgeInstalled) {
  bridgeState.__asusRouterContentBridgeInstalled = true;

  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isOpenDialogMessage(message)) return false;

    try {
      mountDialog(message.initialView ?? 'menu');
      sendResponse({ ok: true } satisfies ExtensionResponse);
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : 'Failed to open router widget';
      sendResponse({ ok: false, error } satisfies ExtensionResponse);
    }
    return false;
  });
}
