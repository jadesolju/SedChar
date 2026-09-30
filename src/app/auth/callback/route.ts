import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://grcpgzmqrzfdhethqgsa.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PDYNR2FQUditnuDLGYZAdQ_AadTBRft';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Handle preview & production deployments behind Vercel edge reverse proxy
  const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.online').replace(/\/+$/, '');
  let targetOrigin = 'https://sedchar.online';
  let targetHost = 'sedchar.online';
  try {
    const parsed = new URL(appBaseUrl);
    targetOrigin = parsed.origin;
    targetHost = (parsed.host.toLowerCase().split(':')[0] || 'sedchar.online').trim();
  } catch {}

  const rawHost = request.headers.get('x-forwarded-host') || requestUrl.host || '';
  const forwardedHost = (rawHost.toLowerCase().split(':')[0] || '').trim();
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const isLocalhost = forwardedHost === 'localhost' || forwardedHost === '127.0.0.1';

  // If callback was received on old domain, redirect user directly to the new domain
  if (!isLocalhost && Boolean(forwardedHost) && (forwardedHost === 'sedchar.vercel.app' || (forwardedHost.endsWith('.vercel.app') && forwardedHost !== targetHost && !targetHost.endsWith('.vercel.app')))) {
    return NextResponse.redirect(`${targetOrigin}${next}`);
  }
  
  if (forwardedHost && !isLocalhost) {
    return NextResponse.redirect(`${forwardedProto}://${forwardedHost}${next}`);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
