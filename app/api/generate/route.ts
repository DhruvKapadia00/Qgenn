import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const config = {
  runtime: 'nodejs',
  maxDuration: 300
};

const TIMEOUT_MS = 300000; // 5 minutes

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

      const systemPrompt = `You are an expert technical interviewer. Generate exactly 5 technical interview questions based on the job description. 
Format each question like this:
- "Question text here"

Focus on key technical skills and concepts from the job description. Questions should test both theoretical knowledge and practical experience.`;

      const userPrompt = `Generate 5 technical interview questions for this position:\n\n${jobDescription}`;

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
          temperature: 0.3,
          max_tokens: 2000
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
