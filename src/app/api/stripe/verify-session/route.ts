import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/utils/supabase/admin';

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

        // 1. Update user_metadata in Supabase Auth
        if (userId && userId !== 'anonymous' && isServiceRole) {
          try {
            await client.auth.admin.updateUserById(userId, {
              user_metadata: { role: 'premium' },
            });
          } catch (authUpdateErr) {
            console.warn('Auth admin update error:', authUpdateErr);
          }
        }

        // 2. Upsert into profiles table
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
