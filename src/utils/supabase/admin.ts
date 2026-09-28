import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase client with admin/service-role capabilities if available,
 * checking all Vercel and Supabase environment variable variations.
 */
export function getSupabaseAdmin(): { client: SupabaseClient; isServiceRole: boolean } {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://grcpgzmqrzfdhethqgsa.supabase.co';

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ADMIN_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VERCEL_SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    const fallbackKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      'sb_publishable_PDYNR2FQUditnuDLGYZAdQ_AadTBRft';

    return {
      client: createClient(supabaseUrl, fallbackKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      }),
      isServiceRole: false,
    };
  }

  return {
    client: createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
    isServiceRole: true,
  };
}
