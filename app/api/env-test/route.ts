import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasDeepseekKey: !!process.env.DEEPSEEK_API_KEY,
    hasPublicKey: !!process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY,
    envKeys: Object.keys(process.env).filter(key => key.includes('DEEPSEEK')),
    nodeEnv: process.env.NODE_ENV,
  });
}
