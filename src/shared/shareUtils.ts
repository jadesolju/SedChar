import type { ThaiMasterCharacter } from './types';

export interface SharedCharacterPayload {
  version: number;
  title: string;
  nickname: string;
  imageUrl?: string;
  mode: 'read-only' | 'edit';
  character: ThaiMasterCharacter;
  createdAt: string;
}

/**
 * Encodes a character into a client-side URL-safe Hash string (Hash-based Zero-Database share).
 * Using URL Hash (#data=...) prevents HTTP 414 URI Too Long errors on servers/Vercel/CDN.
 */
export function encodeCharacterToShareUrl(
  character: ThaiMasterCharacter,
  title?: string,
  mode: 'read-only' | 'edit' = 'read-only',
  imageUrl?: string
): string {
  const payload: SharedCharacterPayload = {
    version: 1,
    title: title || character.fullName || character.nickname || 'ตัวละคร',
    nickname: character.nickname || character.fullName || 'ตัวละคร',
    imageUrl: imageUrl || undefined,
    mode,
    character,
    createdAt: new Date().toISOString(),
  };

  try {
    const jsonStr = JSON.stringify(payload);
    let base64 = '';
    if (typeof window !== 'undefined') {
      base64 = btoa(
        encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );
    } else {
      base64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    // Use URL hash (#data=...) so large payloads are never sent to the server (bypassing 4KB/8KB CDN limits)
    return `${origin}/#data=${encodeURIComponent(base64)}&mode=${mode}`;
  } catch (e) {
    console.error('Failed to encode share URL:', e);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return origin;
  }
}

/**
 * Decodes a character from a URL-safe base64 string (supports both ?data= and #data=)
 */
export function decodeCharacterFromShareUrl(
  dataParam: string
): SharedCharacterPayload | null {
  try {
    let jsonStr = '';
    if (typeof window !== 'undefined') {
      const binary = atob(decodeURIComponent(dataParam));
      jsonStr = decodeURIComponent(
        Array.prototype.map
          .call(binary, (ch: string) => '%' + ('00' + ch.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else {
      jsonStr = Buffer.from(decodeURIComponent(dataParam), 'base64').toString('utf-8');
    }
    const payload = JSON.parse(jsonStr) as SharedCharacterPayload;
    if (payload && payload.character) {
      return payload;
    }
  } catch (e) {
    try {
      let jsonStr = '';
      if (typeof window !== 'undefined') {
        jsonStr = decodeURIComponent(atob(dataParam));
      } else {
        jsonStr = Buffer.from(dataParam, 'base64').toString('utf-8');
      }
      const payload = JSON.parse(jsonStr) as SharedCharacterPayload;
      if (payload && payload.character) {
        return payload;
      }
    } catch (e2) {
      console.warn('Failed to decode share URL param:', e2);
    }
  }
  return null;
}

/**
 * Export character as downloadable JSON file
 */
export function exportCharacterJson(
  character: ThaiMasterCharacter,
  title?: string
) {
  const safeTitle = (title || character.nickname || 'character').replace(/\s+/g, '_');
  const filename = `${safeTitle}_${Date.now()}.sedchar.json`;
  const blob = new Blob([JSON.stringify(character, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
