import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Log the API key (first few characters) to verify it's loaded
console.log('Venice API Key loaded:', process.env.VENICE_API_KEY?.slice(0, 5) + '...');

const venice = new OpenAI({
  apiKey: process.env.VENICE_API_KEY,
  baseURL: "https://api.venice.ai/api/v1"
})

export async function POST(request: Request) {
  try {
    const { content, language } = await request.json()
    
    // Verify API key is available
    if (!process.env.VENICE_API_KEY) {
      throw new Error('Venice API key is not configured');
    }

    console.log('Translating content to:', language)

    // Make the request using fetch directly to see raw response
    const response = await fetch("https://api.venice.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VENICE_API_KEY}`
      },
      body: JSON.stringify({
        model: "dolphin-2.9.2-qwen2-72b",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate the given text to ${
              language === 'fr' ? 'French' : language === 'es' ? 'Spanish' : 'English'
            }. Return only the translated text without any additional formatting or explanation.`
          },
          {
            role: "user",
            content
          }
        ],
        temperature: 0.3,
        // Disable Venice's default system prompts
        venice_parameters: {
          include_venice_system_prompt: false
        }
      })
    });

    const data = await response.json();
    console.log('Raw API response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`Venice API error: ${data.error || 'Unknown error'}`);
    }

    // Access the message content directly since we can see it in the raw response
    const translatedContent = data.choices[0].message.content;
    
    if (!translatedContent) {
      console.error('No translation in response');
      throw new Error('Translation returned empty result');
    }

    console.log('Translation complete');
    return NextResponse.json({ translatedContent });

  } catch (error) {
    console.error('Failed to translate content:', error);
    return NextResponse.json(
      { error: 'Failed to translate content', details: error.message }, 
      { status: 500 }
    );
  }
} 