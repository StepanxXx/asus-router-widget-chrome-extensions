import { mountDialog, unmountDialog } from '../../dialog/ui/mountDialog';

export function unmountNetworks(): void {
  unmountDialog();
}

export function mountNetworks(): void {
  mountDialog('networks');
}
