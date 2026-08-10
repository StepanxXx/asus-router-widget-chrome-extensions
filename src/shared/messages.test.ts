import { describe, expect, it } from 'vitest';
import { isOpenDialogMessage } from './messages';

describe('isOpenDialogMessage', () => {
  it('accepts menu and feature-specific open requests', () => {
    expect(isOpenDialogMessage({ type: 'open-dialog' })).toBe(true);
    expect(isOpenDialogMessage({ type: 'open-dialog', initialView: 'clients' })).toBe(true);
    expect(isOpenDialogMessage({ type: 'open-dialog', initialView: 'networks' })).toBe(true);
  });

  it('rejects unsupported messages', () => {
    expect(isOpenDialogMessage({ type: 'open-feature', feature: 'clients' })).toBe(false);
    expect(isOpenDialogMessage({ type: 'open-dialog', initialView: 'unknown' })).toBe(false);
  });
});
