import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

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
    return NextResponse.json({
      paid: isPaid,
      userId: session.client_reference_id || session.metadata?.userId,
      userEmail: session.customer_email || session.metadata?.userEmail,
      status: session.status,
    });
  } catch (err: any) {
    console.error('Error verifying Stripe session:', err);
    return NextResponse.json({ error: err.message || 'Error verifying session' }, { status: 500 });
  }
}
