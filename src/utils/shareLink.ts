import { Platform, Linking } from 'react-native';
import { AppConfig } from '../types';

// Short keys to keep the URL compact
interface SharePayload {
  r: string; // relayUrl
  a: string; // apiKey
  c: string; // clientId
  u: string; // actorUuid
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return decodeURIComponent(escape(atob(base64)));
}

export function encodeShareData(config: AppConfig): string {
  const payload: SharePayload = {
    r: config.relayUrl,
    a: config.apiKey,
    c: config.clientId,
    u: config.actorUuid,
  };
  return base64UrlEncode(JSON.stringify(payload));
}

export function decodeShareData(encoded: string): AppConfig | null {
  try {
    const json = base64UrlDecode(encoded);
    const payload: SharePayload = JSON.parse(json);
    if (!payload.r || !payload.a || !payload.c || !payload.u) return null;
    return {
      relayUrl: payload.r,
      apiKey: payload.a,
      clientId: payload.c,
      actorUuid: payload.u,
    };
  } catch {
    return null;
  }
}

const WEB_BASE_URL = 'https://silvertreestudios.github.io/silvertree-mobile-sheet';

export function buildShareUrl(config: AppConfig): string {
  const encoded = encodeShareData(config);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('share', encoded);
    return url.toString();
  }
  return `${WEB_BASE_URL}?share=${encoded}`;
}

/** Read share params from the current URL (web) or initial deep link (native). */
export async function getShareParamsFromUrl(): Promise<AppConfig | null> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const share = params.get('share');
    if (share) return decodeShareData(share);
    return null;
  }

  // Native: check initial deep link URL
  try {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      const url = new URL(initialUrl);
      const share = url.searchParams.get('share');
      if (share) return decodeShareData(share);
    }
  } catch {
    // Linking not available or URL parsing failed
  }
  return null;
}

/** Remove the share query param from the browser URL bar without reloading. */
export function clearShareParamsFromUrl(): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.delete('share');
    window.history.replaceState({}, '', url.toString());
  }
}
