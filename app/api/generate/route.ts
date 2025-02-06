import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 30; // Set to 30 seconds max
export const config = {
  runtime: 'nodejs'
};

const TIMEOUT_MS = 25000; // Set to 25 seconds to allow for some buffer

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobDescription } = body;

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      
      if (!apiKey) {
        console.error('API key not configured');
        return NextResponse.json(
          { error: 'API key not configured' },
          { status: 500 }
        );
      }
      
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.deepseek.com',
        timeout: TIMEOUT_MS
      });

      const systemPrompt = `Generate 5 concise technical interview questions with brief answers. Format: Q: "question" A: "answer"`;
      const userPrompt = `Based on this role, generate 5 quick technical questions: ${jobDescription.substring(0, 150)}`;

      const completion = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No content received from API');
      }

      clearTimeout(timeoutId);
      return NextResponse.json({ content: responseContent });
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error:', error);
      return NextResponse.json(
        { error: 'Failed to generate questions' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
