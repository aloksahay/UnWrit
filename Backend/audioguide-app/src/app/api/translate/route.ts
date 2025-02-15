import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const venice = new OpenAI({
  apiKey: process.env.VENICE_API_KEY || '',
  baseURL: "https://api.venice.ai/api/v1"
})

export async function POST(request: Request) {
  try {
    const { content, language } = await request.json()
    
    console.log('Translation request:', {
      language,
      contentPreview: content.slice(0, 100) + '...'
    });

    const response = await venice.chat.completions.create({
      model: "dolphin-2.9.2-qwen2-72b",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Your task is to translate text to ${
            language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English'
          }. You must respond with a JSON object in this exact format:
          {
            "translation": "your translated text here"
          }
          Do not include any other text or formatting in your response.`
        },
        {
          role: "user",
          content
        }
      ],
      temperature: 0.3
    })

    console.log('Venice API Response:', JSON.stringify(response, null, 2));

    const translatedText = JSON.parse(response.choices[0]?.message?.content || '{}').translation;

    if (!translatedText) {
      console.error('No translation in response:', response);
      throw new Error('No translation generated');
    }

    console.log('Translation successful');
    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('Failed to translate:', error);
    if (error instanceof OpenAI.APIError) {
      console.error('Status:', error.status);
      console.error('Message:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to translate content' }, 
      { status: 500 }
    );
  }
} 