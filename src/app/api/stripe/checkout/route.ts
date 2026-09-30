import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, userEmail, plan = 'supporter_29' } = body;
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://sedchar.online';

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
      return NextResponse.json(
        { error: 'ระบบชำระเงินยังไม่พร้อมใช้งาน: กรุณาใส่ STRIPE_SECRET_KEY ใน .env.local หรือ Vercel Environment Variables' },
        { status: 500 }
      );
    }

    const isUniversePro = plan === 'universe_pro_99';
    const productName = isUniversePro
      ? 'SedChar Universe Studio Pro (สิทธิ์ตลอดชีพ 99 บาท)'
      : 'SedChar Creator Supporter (โปรโมชั่น 29 บาท)';
    const productDesc = isUniversePro
      ? 'ปลดล็อค Universal Multi-Parser ไม่จำกัด, AI เติมส่วนที่ขาด, คลังจักรวาลตลอดชีพ, และ AI Quota 100 ครั้ง/วัน'
      : 'ปลดล็อค AI Auto-Enhance 50 ครั้ง/วัน, คลังโปรเจกต์ไม่จำกัด, และระบบประมวลผลความเร็วสูง';
    const unitAmount = isUniversePro ? 9900 : 2900; // in satangs (99.00 THB or 29.00 THB)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'promptpay'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: productName,
              description: productDesc,
            },
            unit_amount: unitAmount,
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
        plan: isUniversePro ? 'universe_pro_99' : 'supporter_29',
        product: isUniversePro ? 'sedchar_universe_pro_99thb' : 'sedchar_premium_promo_29thb',
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
