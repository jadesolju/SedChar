import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRateLimitMap = new Map<string, RateLimitRecord>();

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipRateLimitMap.entries()) {
      if (now > record.resetTime) {
        ipRateLimitMap.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

export interface ServerGuardResult {
  allowed: boolean;
  statusCode?: number;
  error?: string;
  ip: string;
  isAuthenticated: boolean;
  userId?: string;
}

export function validateInputPayload(input: any, maxChars: number = 15000): { valid: boolean; error?: string } {
  if (!input) return { valid: false, error: 'Empty payload' };
  const textRepresentation = typeof input === 'string' ? input : JSON.stringify(input);
  if (textRepresentation.length > maxChars) {
    return {
      valid: false,
      error: `ข้อความมีขนาดยาวเกินไป (สูงสุด ${maxChars.toLocaleString()} ตัวอักษร, ส่งมา ${textRepresentation.length.toLocaleString()} ตัวอักษร)`,
    };
  }
  return { valid: true };
}

export async function verifyServerQuotaAndRateLimit(req: NextRequest): Promise<ServerGuardResult> {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const clientIp = (forwardedFor ? (forwardedFor.split(',')[0] || '').trim() : realIp) || 'unknown-ip';

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

  let isAuthenticated = false;
  let userId: string | undefined = undefined;

  if (token) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
      if (supabaseUrl && supabaseAnonKey) {
        const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': supabaseAnonKey,
          },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData && userData.id) {
            isAuthenticated = true;
            userId = userData.id;
          }
        }
      }
    } catch (err) {
      console.warn('Server auth verification fallback:', err);
    }
  }

  const windowMs = isAuthenticated ? 5 * 60 * 1000 : 10 * 60 * 1000;
  const maxRequests = isAuthenticated ? 40 : 10;
  const trackingKey = userId ? `user:${userId}` : `ip:${clientIp}`;

  const now = Date.now();
  const currentRecord = ipRateLimitMap.get(trackingKey);

  if (!currentRecord || now > currentRecord.resetTime) {
    ipRateLimitMap.set(trackingKey, { count: 1, resetTime: now + windowMs });
  } else {
    currentRecord.count += 1;
    if (currentRecord.count > maxRequests) {
      const waitSeconds = Math.ceil((currentRecord.resetTime - now) / 1000);
      return {
        allowed: false,
        statusCode: 429,
        error: isAuthenticated
          ? `คุณส่งคำขอ AI ถี่เกินไป กรุณารอ ${waitSeconds} วินาทีแล้วลองใหม่อีกครั้ง`
          : `จำกัดการใช้งานสำหรับผู้ใช้ทั่วไป กรุณาเข้าสู่ระบบเพื่อรับโควตาเต็ม หรือรอ ${waitSeconds} วินาที`,
        ip: clientIp,
        isAuthenticated,
        userId,
      };
    }
  }

  return {
    allowed: true,
    ip: clientIp,
    isAuthenticated,
    userId,
  };
}
