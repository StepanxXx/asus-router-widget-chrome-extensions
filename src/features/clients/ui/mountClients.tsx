import { mountDialog, unmountDialog } from '../../dialog/ui/mountDialog';

export function unmountClients(): void {
  unmountDialog();
}

export function mountClients(): void {
  mountDialog('clients');
}
