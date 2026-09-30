import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://grcpgzmqrzfdhethqgsa.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_PDYNR2FQUditnuDLGYZAdQ_AadTBRft";

// Whitelisted API routes that are accessible publicly (these handle their own internal authentication)
const PUBLIC_API_ROUTES = ['/api/health', '/api/auth/callback', '/api/ai', '/api/characters/share', '/api/admin', '/api/stripe'];

export const updateSession = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  // Domain Redirection & Seamless Session Migration for Old Domains
  const rawHost = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const currentHost = (rawHost.toLowerCase().split(':')[0] || '').trim();
  const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost.endsWith('.local');

  const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.online').replace(/\/+$/, '');
  let targetOrigin = 'https://sedchar.online';
  let targetHost = 'sedchar.online';
  try {
    const parsed = new URL(appBaseUrl);
    targetOrigin = parsed.origin;
    targetHost = (parsed.host.toLowerCase().split(':')[0] || 'sedchar.online').trim();
  } catch {}

  const isOldDomain = !isLocalhost && Boolean(currentHost) && (
    currentHost === 'sedchar.vercel.app' ||
    (currentHost.endsWith('.vercel.app') && currentHost !== targetHost && !targetHost.endsWith('.vercel.app'))
  );

  if (isOldDomain) {
    try {
      const tempSupabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {},
        },
      });

      const { data: { session } } = await tempSupabase.auth.getSession();

      if (session?.access_token && session?.refresh_token) {
        const migrateUrl = new URL('/auth/migrate-session', targetOrigin);
        migrateUrl.searchParams.set('access_token', session.access_token);
        migrateUrl.searchParams.set('refresh_token', session.refresh_token);
        const nextDest = request.nextUrl.pathname + request.nextUrl.search;
        migrateUrl.searchParams.set('next', nextDest);
        return NextResponse.redirect(migrateUrl, 307);
      }
    } catch (e) {
      console.warn('Session check during old domain redirect error:', e);
    }

    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, targetOrigin);
    return NextResponse.redirect(targetUrl, 308);
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh user session token
  const { data: { user } } = await supabase.auth.getUser();

  // API Path Protection
  if (pathname.startsWith('/api')) {
    const isPublic = PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));
    const authHeader = request.headers.get('authorization');
    const customApiKey = request.headers.get('x-api-key');
    const validServerKey = process.env.SUPABASE_SECRET_KEY || process.env.API_SECRET_KEY;
    const hasValidKey = Boolean(validServerKey && customApiKey === validServerKey);

    if (!isPublic && !user && !hasValidKey && !authHeader) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Access to /api is protected.',
        },
        { status: 401 }
      );
    }
  }

  return supabaseResponse;
};
