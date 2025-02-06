import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { config } from '../../../src/config';

type QAPair = {
  question: string;
  answer: string;
};

// Using 300-second timeout as configured in vercel.json
const TIMEOUT_MS = 300000; // 300 seconds (5 minutes)

// This API route uses DeepSeek's API to generate interview questions based on a job description.
// It ensures consistent formatting with ||| separators between Q/A pairs and validates that exactly 5 pairs are generated.
// The timeout is set to 300 seconds to accommodate longer processing times.

export async function POST(request: Request) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const { jobDescription } = await request.json();

      if (!jobDescription) {
        clearTimeout(timeoutId);
        return NextResponse.json(
          { error: 'Job description is required' },
          { status: 400 }
        );
      }

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

      // Successfully tested with DeepSeek API - working version
      console.log('Making API request to DeepSeek...');

      const systemPrompt = `You are an expert interviewer. Based on the provided job description, generate 5 relevant interview questions and their detailed answers. Each question should help assess the candidate's suitability for the role. Format your response EXACTLY as follows, and make sure to include all 5 questions:

Q1: First question
A1: First answer
|||
Q2: Second question
A2: Second answer
|||
Q3: Third question
A3: Third answer
|||
Q4: Fourth question
A4: Fourth answer
|||
Q5: Fifth question
A5: Fifth answer`;

      const userPrompt = `Job Description: ${jobDescription}\n\nGenerate 5 relevant interview questions and their answers that will help assess if a candidate is suitable for this role. Make sure to follow the exact format with ||| separators between each Q/A pair.`;

      try {
        const completion = await openai.chat.completions.create({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        });

        console.log('Received response from DeepSeek:', completion.choices[0]?.message?.content?.substring(0, 50) + '...');

        clearTimeout(timeoutId);

        const content = completion.choices[0].message.content;
        if (!content) {
          throw new Error('No content received from API');
        }

        // Parse the response into QA pairs
        const qaPairs: QAPair[] = content.split('|||').map((pair: string) => {
          const lines = pair.trim().split('\n');
          const question = lines[0]?.replace(/^Q\d+:\s*/, '').trim() || '';
          const answer = lines[1]?.replace(/^A\d+:\s*/, '').trim() || '';
          return { question, answer };
        }).filter(pair => pair.question && pair.answer);

        // Ensure we have exactly 5 pairs
        if (qaPairs.length !== 5) {
          console.error('Unexpected number of QA pairs:', qaPairs.length);
          console.log('Raw content:', content);
          return NextResponse.json(
            { error: 'Failed to generate the correct number of questions' },
            { status: 500 }
          );
        }

        return NextResponse.json(qaPairs);
      } catch (apiError: unknown) {
        console.error('DeepSeek API Error:', apiError);
        const errorMessage = apiError instanceof Error 
          ? apiError.message 
          : 'Unknown error';
        return NextResponse.json(
          { error: 'Failed to generate questions: ' + errorMessage },
          { status: 500 }
        );
      }
    } catch (error: unknown) {
      console.error('Error:', error);
      return NextResponse.json(
        { error: 'Failed to generate questions' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
