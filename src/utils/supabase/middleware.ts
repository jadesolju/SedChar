import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

// Whitelisted API routes that are accessible publicly (e.g., health checks, AI endpoints)
const PUBLIC_API_ROUTES = ['/api/health', '/api/auth/callback', '/api/ai'];

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

  // API Path Protection: Prevent unauthorized inspection/access to /api endpoints
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
          message: 'Access to /api is protected. Authentication session or valid API token required.',
        },
        { status: 401 }
      );
    }
  }

  return supabaseResponse;
};
