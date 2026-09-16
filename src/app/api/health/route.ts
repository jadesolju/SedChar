import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'SedChar.AI Engine',
    timestamp: new Date().toISOString(),
  });
}
