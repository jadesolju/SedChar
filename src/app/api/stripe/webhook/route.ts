import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/utils/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const bodyText = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header or STRIPE_WEBHOOK_SECRET' },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(bodyText, sig, webhookSecret);
  } catch (err: any) {
    console.error('⚠️ Stripe Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle successful checkout session
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    let userId = session.client_reference_id || session.metadata?.userId;
    const userEmail = session.customer_email || session.metadata?.userEmail;

    console.log(`✅ Payment succeeded for SedChar 29 THB! User: ${userId} (${userEmail})`);

    try {
      const { client, isServiceRole } = getSupabaseAdmin();

      // If userId is anonymous or missing, look up by email
      if ((!userId || userId === 'anonymous') && userEmail && isServiceRole) {
        try {
          const { data } = await client.auth.admin.listUsers();
          const found = data?.users?.find(
            (u) => u.email?.toLowerCase() === userEmail.toLowerCase()
          );
          if (found) {
            userId = found.id;
          }
        } catch (lookupErr) {
          console.warn('Webhook user lookup note:', lookupErr);
        }
      }

      // 1. Update Supabase Auth user_metadata
      if (userId && userId !== 'anonymous' && isServiceRole) {
        try {
          await client.auth.admin.updateUserById(userId, {
            user_metadata: { role: 'premium' },
          });
        } catch (authUpdateErr) {
          console.warn('Webhook Auth admin update error:', authUpdateErr);
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
        } catch (profileUpsertErr) {
          console.warn('Webhook profiles upsert note:', profileUpsertErr);
        }
      }
    } catch (dbErr) {
      console.error('Error updating profile in Supabase webhook:', dbErr);
    }
  }

  return NextResponse.json({ received: true });
}
