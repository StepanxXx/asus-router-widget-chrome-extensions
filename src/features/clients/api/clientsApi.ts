import { z } from 'zod';
import type { ClientDevice, ClientMap, ClientTrafficSnapshot } from '../model/types';

const clientResponseSchema = z.object({
  fromNetworkmapd: z.array(z.record(z.string(), z.unknown())).min(1),
});

const trafficTupleSchema = z
  .tuple([z.string(), z.coerce.number().finite(), z.coerce.number().finite()])
  .rest(z.unknown());

const trafficResponseSchema = z.object({
  array_traffic: z.array(trafficTupleSchema),
  router_traffic: z.unknown().optional(),
});

const requestHeaders = {
  accept:
    'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
};

export function normalizeClientsResponse(responseText: string): string {
  return responseText
    .replace(/networkmap_fullscan.*/gims, '')
    .replace(/.*originData = /gims, '')
    .replace('fromNetworkmapd', '"fromNetworkmapd"')
    .replace('nmpClient', '"nmpClient"');
}

export function parseClientsResponse(responseText: string): ClientMap {
  const normalizedResponse = normalizeClientsResponse(responseText);
  const parsedResponse: unknown = JSON.parse(normalizedResponse);
  const response = clientResponseSchema.parse(parsedResponse);
  const clients: ClientMap = {};

  for (const [key, value] of Object.entries(response.fromNetworkmapd[0])) {
    if (key === 'maclist' || key === 'ClientAPILevel') continue;
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    clients[key] = value as ClientDevice;
  }

  return clients;
}

export function normalizeClientTrafficResponse(responseText: string): string {
  return responseText
    .replace(/.* new Array\(\);/gims, '')
    .replace('array_traffic = ', '{"array_traffic":')
    .replace('router_traffic = ', '"router_traffic":')
    .replace(';', ',')
    .replace(';', '}');
}

export function parseClientTrafficResponse(
  responseText: string,
  stamp: number = Date.now(),
): ClientTrafficSnapshot {
  const normalizedResponse = normalizeClientTrafficResponse(responseText);
  const parsedResponse: unknown = JSON.parse(normalizedResponse);
  const response = trafficResponseSchema.parse(parsedResponse);
  const traffic: ClientTrafficSnapshot['traffic'] = {};

  for (const [client, out, inc] of response.array_traffic) {
    traffic[client] = { inc, out };
  }

  return { stamp, traffic };
}

async function fetchText(url: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(url, {
    headers: requestHeaders,
    method: 'GET',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Client request failed with status ${response.status}`);
  }

  return response.text();
}

export async function fetchClients(origin: string, signal?: AbortSignal): Promise<ClientMap> {
  const responseText = await fetchText(`${origin}/update_clients.asp?_=${Date.now()}`, signal);
  return parseClientsResponse(responseText);
}

export async function fetchClientTraffic(
  origin: string,
  signal?: AbortSignal,
): Promise<ClientTrafficSnapshot> {
  const responseText = await fetchText(`${origin}/getTraffic.asp?_=${Date.now()}`, signal);
  return parseClientTrafficResponse(responseText);
}
