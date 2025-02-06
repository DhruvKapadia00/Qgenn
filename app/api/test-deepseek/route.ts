import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DEEPSEEK_API_KEY is not set in environment variables' },
        { status: 500 }
      );
    }

    console.log('Testing DeepSeek API connection...');
    
    const openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    });

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: "Say 'Hello from DeepSeek!'" }],
      model: "deepseek-chat",
    });

    return NextResponse.json({
      success: true,
      message: completion.choices[0].message.content
    });
  } catch (error: any) {
    console.error('DeepSeek API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
