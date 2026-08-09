import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchNetworkSnapshot, normalizeNetworkResponse, parseNetworkResponse } from './networkApi';

const routerResponse = `netdev = {
'INTERNET':{rx:100,tx:200},
'WIRED':{rx:300,tx:400}
}`;

describe('network API parser', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes the JavaScript-like ASUS response', () => {
    expect(JSON.parse(normalizeNetworkResponse(routerResponse))).toEqual({
      INTERNET0: { rx: '100', tx: '200' },
      WIRED: { rx: '300', tx: '400' },
    });
  });

  it('returns validated numeric counters and a supplied timestamp', () => {
    expect(parseNetworkResponse(routerResponse, 1234)).toEqual({
      stamp: 1234,
      interfaces: {
        INTERNET0: { rx: 100, tx: 200 },
        WIRED: { rx: 300, tx: 400 },
      },
    });
  });

  it('rejects invalid counters', () => {
    const invalidResponse = `netdev = {
'WIRED':{rx:not-a-number,tx:400}
}`;

    expect(() => parseNetworkResponse(invalidResponse)).toThrow();
  });

  it('reports an HTTP failure before parsing the response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    await expect(fetchNetworkSnapshot('http://router.test')).rejects.toThrow(
      'Network request failed with status 503',
    );
  });
});
