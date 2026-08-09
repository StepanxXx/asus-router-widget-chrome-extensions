import { describe, expect, it } from 'vitest';
import { transformClientData } from './transformClientData';
import type { ClientMap, ClientTrafficState } from './types';

const clients: ClientMap = {
  online: { name: 'Laptop', isOnline: '1' },
  offline: { name: 'Printer', isOnline: '0' },
};

describe('transformClientData', () => {
  it('combines client information with traffic counters', () => {
    const state = transformClientData(
      clients,
      {
        stamp: 1000,
        traffic: {
          online: { inc: 200, out: 100 },
          offline: { inc: 20, out: 10 },
        },
      },
      null,
    );

    expect(state.clients.online).toMatchObject({ inc: 200, out: 100, speedInc: 0, speedOut: 0 });
    expect(state.clients.offline.log).toEqual([]);
  });

  it('calculates speed and resets offline client history', () => {
    const previous = transformClientData(
      clients,
      {
        stamp: 1000,
        traffic: {
          online: { inc: 200, out: 100 },
          offline: { inc: 20, out: 10 },
        },
      },
      null,
    );
    const current = transformClientData(
      clients,
      {
        stamp: 3000,
        traffic: {
          online: { inc: 600, out: 300 },
          offline: { inc: 40, out: 20 },
        },
      },
      previous,
    );

    expect(current.clients.online).toMatchObject({ speedInc: 200, speedOut: 100 });
    expect(current.clients.online.log).toHaveLength(2);
    expect(current.clients.offline.log).toEqual([]);
    expect(current.max).toBe(200);
  });

  it('handles counter reset without negative speed', () => {
    const previous = transformClientData(
      { online: clients.online },
      { stamp: 1000, traffic: { online: { inc: 200, out: 100 } } },
      null,
    );
    const current = transformClientData(
      { online: clients.online },
      { stamp: 3000, traffic: { online: { inc: 10, out: 5 } } },
      previous,
    );

    expect(current.clients.online).toMatchObject({ speedInc: 0, speedOut: 0 });
  });

  it('keeps only the latest 30 samples', () => {
    let state: ClientTrafficState | null = null;

    for (let index = 0; index <= 35; index += 1) {
      state = transformClientData(
        { online: clients.online },
        {
          stamp: index * 1000,
          traffic: { online: { inc: index * 100, out: index * 50 } },
        },
        state,
      );
    }

    expect(state?.clients.online.log).toHaveLength(30);
    expect(state?.clients.online.log[0]?.stamp).toBe(6000);
    expect(state?.clients.online.log.at(-1)?.stamp).toBe(35000);
  });
});
