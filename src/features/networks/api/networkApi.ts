import type { NetworkSnapshot } from '../model/types';

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
  const parsedResponse = JSON.parse(normalizedResponse) as Record<
    string,
    { rx: string | number; tx: string | number }
  >;
  const interfaces = Object.fromEntries(
    Object.entries(parsedResponse).map(([name, counters]) => [
      name,
      { rx: Number(counters.rx), tx: Number(counters.tx) },
    ]),
  );

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
