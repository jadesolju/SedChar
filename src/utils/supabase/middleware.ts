import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://grcpgzmqrzfdhethqgsa.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_PDYNR2FQUditnuDLGYZAdQ_AadTBRft";

// Whitelisted API routes that are accessible publicly
const PUBLIC_API_ROUTES = ['/api/health', '/api/auth/callback', '/api/ai', '/api/characters/share'];

export const updateSession = async (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

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

  // Cache-Control HTTP Headers for Non-Static Requests
  supabaseResponse.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  supabaseResponse.headers.set("Pragma", "no-cache");
  supabaseResponse.headers.set("Expires", "0");

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
