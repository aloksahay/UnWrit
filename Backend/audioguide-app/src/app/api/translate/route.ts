import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const venice = new OpenAI({
  apiKey: process.env.VENICE_API_KEY,
  baseURL: "https://api.venice.ai/api/v1"
})

export async function POST(request: Request) {
  try {
    const { content, language } = await request.json()
    
    console.log('Translating to:', language);

    const response = await venice.chat.completions.create({
      model: "dolphin-2.9.2-qwen2-72b",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Your task is to translate text to ${
            language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English'
          }. Return only the translated text without any formatting or JSON structure.`
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.3,
      venice_parameters: {
        include_venice_system_prompt: false
      }
    });

    // Parse the response if it's a string
    const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
    
    const translatedText = parsedResponse.choices?.[0]?.message?.content;

    if (!translatedText) {
      console.error('No translation in response');
      throw new Error('Translation failed');
    }

    console.log('Translation successful');
    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('Translation failed:', error);
    return NextResponse.json(
      { error: 'Failed to translate content' }, 
      { status: 500 }
    );
  }
} 