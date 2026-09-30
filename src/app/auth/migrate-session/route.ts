import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://grcpgzmqrzfdhethqgsa.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_PDYNR2FQUditnuDLGYZAdQ_AadTBRft';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const refreshToken = requestUrl.searchParams.get('refresh_token');
  const accessToken = requestUrl.searchParams.get('access_token');
  const next = requestUrl.searchParams.get('next') || '/';

  // Protect against open redirect attacks: only allow valid relative paths
  const safeNext = (next.startsWith('/') && !next.startsWith('//')) ? next : '/';
  const redirectTarget = new URL(safeNext, requestUrl.origin);

  const response = NextResponse.redirect(redirectTarget, 307);

  if (refreshToken && accessToken) {
    try {
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
                cookiesToSet.forEach(({ name, value, options }) => {
                  response.cookies.set(name, value, {
                    ...options,
                    path: '/',
                    sameSite: 'lax',
                    secure: process.env.NODE_ENV === 'production',
                  });
                });
              } catch {}
            },
          },
        }
      );

      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (err) {
      console.warn('Seamless session migration note:', err);
    }
  }

  return response;
}
