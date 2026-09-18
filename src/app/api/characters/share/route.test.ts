import { describe, it, expect, vi } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('Share Route Security - Cryptographically Secure Share ID', () => {
  it('generates a share ID starting with sh_, containing timestamp and 8 hex characters', async () => {
    const req = new NextRequest('http://localhost:3000/api/characters/share', {
      method: 'POST',
      body: JSON.stringify({ character: { name: 'Test Character' } }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.shareId).toBeDefined();

    // Verify format: sh_{timestamp_base36}_{8_hex_chars}
    const parts = data.shareId.split('_');
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe('sh');
    // Timestamp base36 part check
    expect(parts[1]).toMatch(/^[0-9a-z]+$/);
    // 8 hex chars random part check
    expect(parts[2]).toMatch(/^[0-9a-f]{8}$/);
  });

  it('generates unique share IDs on consecutive calls using crypto.getRandomValues', async () => {
    const getRandomValuesSpy = vi.spyOn(crypto, 'getRandomValues');

    const req1 = new NextRequest('http://localhost:3000/api/characters/share', {
      method: 'POST',
      body: JSON.stringify({ character: { name: 'Char 1' } }),
    });
    const req2 = new NextRequest('http://localhost:3000/api/characters/share', {
      method: 'POST',
      body: JSON.stringify({ character: { name: 'Char 2' } }),
    });

    const res1 = await POST(req1);
    const res2 = await POST(req2);

    const data1 = await res1.json();
    const data2 = await res2.json();

    expect(data1.shareId).not.toBe(data2.shareId);
    expect(getRandomValuesSpy).toHaveBeenCalled();

    getRandomValuesSpy.mockRestore();
  });
});
