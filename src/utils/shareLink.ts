import { Platform, Linking } from 'react-native';
import { AppConfig } from '../types';

// Short keys to keep the URL compact
interface SharePayload {
  r: string; // relayUrl
  a: string; // apiKey
  c: string; // clientId
  u: string; // actorUuid
}

// Cross-platform base64url encode/decode (no btoa/atob/escape/unescape)
function utf8ToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      bytes.push(c);
    } else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff) {
      const hi = c;
      const lo = str.charCodeAt(++i);
      c = 0x10000 + ((hi - 0xd800) << 10) + (lo - 0xdc00);
      bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    } else {
      bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return bytes;
}

function bytesToUtf8(bytes: number[]): string {
  let str = '';
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i++];
    if (b < 0x80) {
      str += String.fromCharCode(b);
    } else if (b < 0xe0 && i < bytes.length) {
      str += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
    } else if (b < 0xf0 && i + 1 < bytes.length) {
      str += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
    } else if (i + 2 < bytes.length) {
      const cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
      str += String.fromCharCode(0xd800 + ((cp - 0x10000) >> 10), 0xdc00 + ((cp - 0x10000) & 0x3ff));
    }
  }
  return str;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64UrlEncode(str: string): string {
  const bytes = utf8ToBytes(str);
  let result = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1] ?? 0, c = bytes[i + 2] ?? 0;
    result += B64[a >> 2] + B64[((a & 3) << 4) | (b >> 4)];
    if (i + 1 < bytes.length) result += B64[((b & 0xf) << 2) | (c >> 6)];
    if (i + 2 < bytes.length) result += B64[c & 0x3f];
  }
  return result.replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bytes: number[] = [];
  for (let i = 0; i < base64.length; i += 4) {
    const a = B64.indexOf(base64[i]);
    const b = B64.indexOf(base64[i + 1] ?? 'A');
    const c = base64[i + 2] ? B64.indexOf(base64[i + 2]) : -1;
    const d = base64[i + 3] ? B64.indexOf(base64[i + 3]) : -1;
    bytes.push((a << 2) | (b >> 4));
    if (c >= 0) bytes.push(((b & 0xf) << 4) | (c >> 2));
    if (d >= 0) bytes.push(((c & 3) << 6) | d);
  }
  return bytesToUtf8(bytes);
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
    // Use URL fragment (#) instead of query param to avoid leaking the API key
    // via Referer headers, server logs, or browser history
    const base = window.location.href.split('#')[0].split('?')[0];
    return `${base}#share=${encoded}`;
  }
  return `${WEB_BASE_URL}#share=${encoded}`;
}

/** Extract the share payload from a URL fragment (e.g. `#share=<encoded>`). */
function extractShareFromFragment(hash: string): string | null {
  if (!hash || !hash.includes('share=')) return null;
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(fragment);
  return params.get('share');
}

/** Read share params from the current URL (web) or initial deep link (native). */
export async function getShareParamsFromUrl(): Promise<AppConfig | null> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const share = extractShareFromFragment(window.location.hash);
    if (share) return decodeShareData(share);
    return null;
  }

  // Native: check initial deep link URL
  try {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      const hashIndex = initialUrl.indexOf('#');
      if (hashIndex >= 0) {
        const share = extractShareFromFragment(initialUrl.slice(hashIndex));
        if (share) return decodeShareData(share);
      }
    }
  } catch {
    // Linking not available or URL parsing failed
  }
  return null;
}

/** Remove the share fragment from the browser URL bar without reloading. */
export function clearShareParamsFromUrl(): void {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const url = window.location.href.split('#')[0];
    window.history.replaceState({}, '', url);
  }
}
