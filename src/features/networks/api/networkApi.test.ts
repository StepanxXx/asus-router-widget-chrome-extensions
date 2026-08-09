import { describe, expect, it } from 'vitest';
import { normalizeNetworkResponse, parseNetworkResponse } from './networkApi';

const routerResponse = `netdev = {
'INTERNET':{rx:100,tx:200},
'WIRED':{rx:300,tx:400}
}`;

describe('network API parser', () => {
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
});
