import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 300; // Set to maximum possible (300 seconds / 5 minutes)
export const config = {
  runtime: 'nodejs'
};

const TIMEOUT_MS = 290000; // Set to 290 seconds to allow for some buffer

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

      const systemPrompt = `You are an expert technical interviewer. Generate 5 high-quality technical questions that assess both knowledge and problem-solving skills. Each question should:
1. Be specific and focused
2. Test real-world scenarios
3. Reveal candidate's depth of understanding
Format each as: Q: "question" A: "concise but informative answer"`;

      const userPrompt = `For this ${jobDescription.substring(0, 100)} role, generate 5 technical questions focusing on the most critical skills. Mix theoretical knowledge and practical experience.`;

      const completion = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000, // Increased token limit
        presence_penalty: 0.2,
        frequency_penalty: 0.3
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
