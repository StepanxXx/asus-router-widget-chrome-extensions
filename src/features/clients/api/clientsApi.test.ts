import { describe, expect, it } from 'vitest';
import {
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
  it('normalizes and parses client data while removing metadata', () => {
    expect(JSON.parse(normalizeClientsResponse(clientsResponse))).toHaveProperty('fromNetworkmapd');
    expect(parseClientsResponse(clientsResponse)).toEqual({
      'AA:BB': { name: 'Laptop', isOnline: '1' },
    });
  });

  it('normalizes traffic data and maps tuple directions', () => {
    expect(JSON.parse(normalizeClientTrafficResponse(trafficResponse))).toHaveProperty('array_traffic');
    expect(parseClientTrafficResponse(trafficResponse, 1234)).toEqual({
      stamp: 1234,
      traffic: {
        'AA:BB': { out: 100, inc: 200 },
      },
    });
  });

  it('rejects malformed traffic counters', () => {
    const invalidResponse = `var array_traffic = new Array();
array_traffic = [["AA:BB","invalid",200]];
router_traffic = [];`;

    expect(() => parseClientTrafficResponse(invalidResponse)).toThrow();
  });
});
