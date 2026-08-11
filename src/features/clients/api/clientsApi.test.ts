import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchClients,
  normalizeClientTrafficResponse,
  normalizeClientsResponse,
  parseClientTrafficResponse,
  parseClientsResponse,
} from './clientsApi';

const clientsResponse = `originData = {fromNetworkmapd:[{"AA:BB":{"name":"Laptop","isOnline":"1"},"maclist":[],"ClientAPILevel":"1"}],nmpClient:[]}
networkmap_fullscan = 0;`;

const trafficResponse = `var array_traffic = new Array();
array_traffic = [["AA:BB",100,200]];
router_traffic = [300,400];`;

describe('clients API parser', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes and parses client data while removing metadata', () => {
    expect(JSON.parse(normalizeClientsResponse(clientsResponse))).toHaveProperty('fromNetworkmapd');
    expect(parseClientsResponse(clientsResponse)).toEqual({
      'AA:BB': { name: 'Laptop', isOnline: '1' },
    });
  });

  it('normalizes traffic data and maps tuple directions', () => {
    expect(JSON.parse(normalizeClientTrafficResponse(trafficResponse))).toHaveProperty(
      'array_traffic',
    );
    expect(parseClientTrafficResponse(trafficResponse, 1234)).toEqual({
      stamp: 1234,
      traffic: {
        'AA:BB': { out: 100, inc: 200 },
      },
    });
  });

  it('rejects an incomplete client response', () => {
    expect(() => parseClientsResponse('originData = {fromNetworkmapd:[],nmpClient:[]}')).toThrow();
  });

  it('reports an HTTP failure before parsing the response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(fetchClients('http://router.test')).rejects.toThrow(
      'Client request failed with status 500',
    );
  });
});
