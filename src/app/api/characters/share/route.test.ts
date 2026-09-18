import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('POST /api/characters/share security test', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should not trust client-supplied origin or host headers and use server configuration', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://sedchar.vercel.app';

    const req = new NextRequest('http://localhost:3000/api/characters/share', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': 'https://evil-attacker.com',
        'host': 'evil-attacker.com',
      },
      body: JSON.stringify({
        character: { name: 'Test Character' },
        permission: 'read-only',
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.shareUrl).not.toContain('evil-attacker.com');
    expect(data.shareUrl.startsWith('https://sedchar.vercel.app/?share=')).toBe(true);
  });
});
