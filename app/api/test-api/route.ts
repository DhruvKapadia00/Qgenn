import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { config } from '../../config';

export async function GET() {
  try {
    console.log('Testing DeepSeek API connection...');
    
    const openai = new OpenAI({
      apiKey: config.deepseekApiKey,
      baseURL: 'https://api.deepseek.com'
    });

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "user", content: "Hello! This is a test message." }
      ],
      max_tokens: 50
    });

    return NextResponse.json({
      success: true,
      response: completion.choices[0]?.message?.content,
      model: completion.model,
      usage: completion.usage
    });

  } catch (error) {
    console.error('API Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
