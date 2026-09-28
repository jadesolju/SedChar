import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { sql } from '@/utils/supabase/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const isPaid = session.payment_status === 'paid';
    let userId = session.client_reference_id || session.metadata?.userId;
    const userEmail = session.customer_email || session.metadata?.userEmail;

    // If payment is successful, persist the Premium role to Supabase
    if (isPaid) {
      try {
        const { client, isServiceRole } = getSupabaseAdmin();

        // 1. Direct SQL update on auth.users if SQL connection is available
        if (sql) {
          try {
            if (userId && userId !== 'anonymous') {
              await sql`
                UPDATE auth.users 
                SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'premium'::text),
                    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'premium'::text)
                WHERE id::text = ${userId};
              `;
            } else if (userEmail) {
              const updatedRows = await sql`
                UPDATE auth.users 
                SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'premium'::text),
                    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'premium'::text)
                WHERE email = ${userEmail}
                RETURNING id::text as id;
              `;
              if (updatedRows && updatedRows.length > 0 && updatedRows[0]) {
                userId = (updatedRows[0] as any).id;
              }
            }
          } catch (sqlErr) {
            console.warn('SQL update note in verify-session:', sqlErr);
          }
        }

        // If userId was 'anonymous' or missing, attempt to find user by email
        if ((!userId || userId === 'anonymous') && userEmail && isServiceRole) {
          try {
            const { data } = await client.auth.admin.listUsers();
            const foundUser = data?.users?.find(
              (u) => u.email?.toLowerCase() === userEmail.toLowerCase()
            );
            if (foundUser) {
              userId = foundUser.id;
            }
          } catch (listErr) {
            console.warn('Could not list users during session verification:', listErr);
          }
        }

        // 2. Update user_metadata and app_metadata in Supabase Auth
        if (userId && userId !== 'anonymous' && isServiceRole) {
          try {
            await client.auth.admin.updateUserById(userId, {
              user_metadata: { role: 'premium' },
              app_metadata: { role: 'premium' },
            });
          } catch (authUpdateErr) {
            console.warn('Auth admin update error:', authUpdateErr);
          }
        }

        // 3. Upsert into profiles table
        if (userId && userId !== 'anonymous') {
          try {
            await client.from('profiles').upsert({
              id: userId,
              email: userEmail || null,
              role: 'premium',
              updated_at: new Date().toISOString(),
            });
          } catch (profileErr) {
            console.warn('Profiles upsert note in verify-session:', profileErr);
          }
        }
      } catch (dbErr) {
        console.error('Error persisting premium role in verify-session:', dbErr);
      }
    }

    return NextResponse.json({
      paid: isPaid,
      role: isPaid ? 'premium' : 'free',
      userId,
      userEmail,
      status: session.status,
    });
  } catch (err: any) {
    console.error('Error verifying Stripe session:', err);
    return NextResponse.json({ error: err.message || 'Error verifying session' }, { status: 500 });
  }
}
