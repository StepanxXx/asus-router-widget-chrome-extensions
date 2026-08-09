import { z } from 'zod';
import type { NetworkSnapshot } from '../model/types';

const networkCountersSchema = z.object({
  rx: z.coerce.number().finite(),
  tx: z.coerce.number().finite(),
});

const networkResponseSchema = z.record(z.string(), networkCountersSchema);

export function normalizeNetworkResponse(responseText: string): string {
  return responseText
    .replace('netdev = ', '')
    .replace('INTERNET', 'INTERNET0')
    .replaceAll("'", '"')
    .replaceAll('rx:', '"rx":"')
    .replaceAll(',tx:', '","tx":"')
    .replaceAll('}', '"}')
    .replace('\n"}', '\n}');
}

export function parseNetworkResponse(
  responseText: string,
  stamp: number = Date.now(),
): NetworkSnapshot {
  const normalizedResponse = normalizeNetworkResponse(responseText);
  const parsedResponse: unknown = JSON.parse(normalizedResponse);
  const interfaces = networkResponseSchema.parse(parsedResponse);

  return { stamp, interfaces };
}

export async function fetchNetworkSnapshot(
  origin: string,
  signal?: AbortSignal,
): Promise<NetworkSnapshot> {
  const response = await fetch(`${origin}/update.cgi?_=${Date.now()}`, {
    headers: {
      'content-type': 'text/plain;charset=UTF-8',
    },
    body: 'output=netdev',
    method: 'POST',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Network request failed with status ${response.status}`);
  }

  return parseNetworkResponse(await response.text());
}
