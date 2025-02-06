import { NextResponse } from 'next/server';
import { config } from '../../config';

export async function GET() {
  return NextResponse.json({
    envVars: {
      nodeEnv: process.env.NODE_ENV,
      hasDeepseekKey: !!process.env.DEEPSEEK_API_KEY,
      deepseekKeyPrefix: process.env.DEEPSEEK_API_KEY?.substring(0, 5),
      configKeyPrefix: config.deepseekApiKey?.substring(0, 5),
      keyLength: process.env.DEEPSEEK_API_KEY?.length
    }
  });
}
