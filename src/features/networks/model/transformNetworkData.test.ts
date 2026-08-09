import { describe, expect, it } from 'vitest';
import { networkTypes } from './networkConfig';
import { transformNetworkData } from './transformNetworkData';
import type { NetworkSnapshot, NetworkTrafficState } from './types';

function createSnapshot(
  stamp: number,
  values: { internetRx: number; internetTx: number; wiredRx: number; wiredTx: number },
): NetworkSnapshot {
  return {
    stamp,
    interfaces: {
      INTERNET0: { rx: values.internetRx, tx: values.internetTx },
      WIRED: { rx: values.wiredRx, tx: values.wiredTx },
    },
  };
}

describe('transformNetworkData', () => {
  it('creates totals without speed for the initial snapshot', () => {
    const state = transformNetworkData(
      createSnapshot(1000, {
        internetRx: 1000,
        internetTx: 2000,
        wiredRx: 3000,
        wiredTx: 4000,
      }),
      null,
      networkTypes,
    );

    expect(state.interfaces.INTERNET0).toEqual({
      total: { inc: 1000, out: 2000 },
      speed: { log: [] },
    });
    expect(state.interfaces.WIRED).toEqual({
      total: { inc: 4000, out: 3000 },
      speed: { log: [] },
    });
    expect(state.max).toBe(0);
    expect(state.min).toBe(0);
  });

  it('calculates direction-aware speed per second', () => {
    const previous = transformNetworkData(
      createSnapshot(1000, {
        internetRx: 1000,
        internetTx: 2000,
        wiredRx: 3000,
        wiredTx: 4000,
      }),
      null,
      networkTypes,
    );
    const current = transformNetworkData(
      createSnapshot(3000, {
        internetRx: 1200,
        internetTx: 2600,
        wiredRx: 3400,
        wiredTx: 4100,
      }),
      previous,
      networkTypes,
    );

    expect(current.interfaces.INTERNET0.speed).toMatchObject({ inc: 100, out: 300 });
    expect(current.interfaces.WIRED.speed).toMatchObject({ inc: 50, out: 200 });
    expect(current.max).toBe(300);
    expect(current.min).toBe(50);
  });

  it('returns zero speed when counters reset or time does not advance', () => {
    const previous = transformNetworkData(
      createSnapshot(1000, {
        internetRx: 1000,
        internetTx: 2000,
        wiredRx: 3000,
        wiredTx: 4000,
      }),
      null,
      networkTypes,
    );
    const current = transformNetworkData(
      createSnapshot(1000, {
        internetRx: 10,
        internetTx: 20,
        wiredRx: 30,
        wiredTx: 40,
      }),
      previous,
      networkTypes,
    );

    expect(current.interfaces.INTERNET0.speed).toMatchObject({ inc: 0, out: 0 });
    expect(current.interfaces.WIRED.speed).toMatchObject({ inc: 0, out: 0 });
  });

  it('keeps only the latest 30 traffic samples', () => {
    let state: NetworkTrafficState | null = null;

    for (let index = 0; index <= 35; index += 1) {
      state = transformNetworkData(
        createSnapshot(index * 1000, {
          internetRx: index * 100,
          internetTx: index * 200,
          wiredRx: index * 300,
          wiredTx: index * 400,
        }),
        state,
        networkTypes,
      );
    }

    expect(state?.interfaces.INTERNET0.speed.log).toHaveLength(30);
    expect(state?.interfaces.INTERNET0.speed.log[0]?.stamp).toBe(6000);
    expect(state?.interfaces.INTERNET0.speed.log.at(-1)?.stamp).toBe(35000);
  });

  it('ignores configured interfaces missing from a snapshot', () => {
    const state = transformNetworkData(
      { stamp: 1000, interfaces: { WIRED: { rx: 10, tx: 20 } } },
      null,
      networkTypes,
    );

    expect(Object.keys(state.interfaces)).toEqual(['WIRED']);
  });
});
