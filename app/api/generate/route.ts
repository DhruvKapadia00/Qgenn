import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60; // Set to 60 seconds max
export const config = {
  runtime: 'nodejs'
};

const TIMEOUT_MS = 55000; // Set to 55 seconds to allow for some buffer

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
      // Debug environment variables
      console.log('Environment variables:', {
        hasDeepseekKey: !!process.env.DEEPSEEK_API_KEY,
        hasPublicKey: !!process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY,
        envKeys: Object.keys(process.env).filter(key => key.includes('DEEPSEEK')),
      });

      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      
      if (!apiKey) {
        console.error('Neither DEEPSEEK_API_KEY nor NEXT_PUBLIC_DEEPSEEK_API_KEY is set');
        return NextResponse.json(
          { error: 'API key not configured' },
          { status: 500 }
        );
      }

      console.log('Using API key:', apiKey.substring(0, 5) + '...');
      
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.deepseek.com',
        timeout: TIMEOUT_MS
      });

      const systemPrompt = `You are a technical interviewer. Generate 5 short, focused technical questions. Keep answers brief and direct.
Format:
Q: "Question"
A: "Brief answer"`;

      const userPrompt = `Generate 5 quick technical questions for: ${jobDescription.substring(0, 200)}`;

      // Successfully tested with DeepSeek API - working version
      console.log('Making API request to DeepSeek...');

      try {
        console.log('Starting API request with job description:', jobDescription.substring(0, 100) + '...');
        
        const completion = await openai.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
          throw new Error('No content received from API');
        }

        console.log('Received response from DeepSeek:', responseContent.substring(0, 100) + '...');
        console.log('Response status:', completion.choices[0]?.finish_reason);

        clearTimeout(timeoutId);

        console.log('Sending response to client:', responseContent.substring(0, 100) + '...');

        return NextResponse.json({ content: responseContent });
      } catch (error) {
        console.error('Error calling DeepSeek API:', error);
        return NextResponse.json(
          { error: 'Failed to generate questions' },
          { status: 500 }
        );
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
