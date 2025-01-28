import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { config } from '../../config';

type QAPair = {
  question: string;
  answer: string;
};

export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: config.deepseekApiKey,
      baseURL: 'https://api.deepseek.com'
    });

    console.log('Making API request to DeepSeek...');

    const systemPrompt = `You are an expert interviewer. Based on the provided job description, generate 5 relevant interview questions and their detailed answers. Each question should help assess the candidate's suitability for the role. Format your response exactly as follows:

Q1: First question
A1: First answer
|||
Q2: Second question
A2: Second answer
... and so on for all 5 pairs.`;

    const userPrompt = `Job Description: ${jobDescription}\n\nGenerate 5 relevant interview questions and their answers that will help assess if a candidate is suitable for this role.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

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
}
