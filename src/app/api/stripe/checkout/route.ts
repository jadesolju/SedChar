import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, userEmail } = body;
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.vercel.app';

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json(
        { error: 'ระบบชำระเงินยังไม่พร้อมใช้งาน: กรุณาใส่ STRIPE_SECRET_KEY ใน .env.local หรือ Vercel Environment Variables' },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'promptpay'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: 'SedChar Creator Premium (โปรโมชั่น 29 บาท)',
              description: 'ปลดล็อก AI Auto-Enhance 50 ครั้ง/วัน, คลังโปรเจกต์ไม่จำกัด, และระบบประมวลผลความเร็วสูง',
            },
            unit_amount: 2900, // 29.00 THB in satangs
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: userId || undefined,
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId || 'anonymous',
        userEmail: userEmail || '',
        product: 'sedchar_premium_promo_29thb',
      },
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe Checkout Session Error:', err);
    return NextResponse.json(
      { error: err.message || 'ไม่สามารถสร้างรายการชำระเงินผ่าน Stripe ได้' },
      { status: 500 }
    );
  }
}
