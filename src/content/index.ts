import {
  isOpenFeatureMessage,
  type ExtensionResponse,
} from '../shared/messages';
import { mountNetworks, unmountNetworks } from '../features/networks/ui/mountNetworks';
import { mountClients, unmountClients } from '../features/clients/ui/mountClients';

const bridgeState = globalThis as typeof globalThis & {
  __asusRouterContentBridgeInstalled?: boolean;
};

if (!bridgeState.__asusRouterContentBridgeInstalled) {
  bridgeState.__asusRouterContentBridgeInstalled = true;

  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isOpenFeatureMessage(message)) return false;

    if (message.feature === 'networks') {
      try {
        unmountClients();
        mountNetworks();
        sendResponse({ ok: true } satisfies ExtensionResponse);
      } catch (cause) {
        const error = cause instanceof Error ? cause.message : 'Failed to open Networks';
        sendResponse({ ok: false, error } satisfies ExtensionResponse);
      }
      return false;
    }

    try {
      unmountNetworks();
      mountClients();
      sendResponse({ ok: true } satisfies ExtensionResponse);
    } catch (cause) {
      const error = cause instanceof Error ? cause.message : 'Failed to open Clients';
        sendResponse({ ok: false, error } satisfies ExtensionResponse);
    }
    return false;
  });
}
