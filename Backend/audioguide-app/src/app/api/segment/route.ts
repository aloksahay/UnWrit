import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const venice = new OpenAI({
  apiKey: process.env.VENICE_API_KEY || '',
  baseURL: "https://api.venice.ai/api/v1"
})

interface Segment {
  title: string;
  content: string;
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json()
    
    console.log('Segmenting content...')

    const response = await venice.chat.completions.create({
      model: "dolphin-2.9.2-qwen2-72b",
      messages: [
        {
          role: "system",
          content: `You are a museum guide content organizer. Your task is to break down museum content into segments.
          You must respond with a JSON object in this exact format:
          {
            "segments": [
              {
                "title": "Section Title",
                "content": "Section Content"
              }
            ]
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

    const responseContent = response.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('Empty response from Venice API');
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(responseContent);
    
    // Extract segments array
    const { segments } = parsedResponse;
    
    if (!Array.isArray(segments)) {
      throw new Error('Invalid response format: segments is not an array');
    }

    // Validate each segment
    const validatedSegments = segments.map((segment: any, index: number) => {
      if (!segment.title || !segment.content) {
        throw new Error(`Invalid segment format at index ${index}`);
      }
      return {
        title: segment.title,
        content: segment.content
      };
    });

    console.log(`Successfully processed ${validatedSegments.length} segments`);
    return NextResponse.json({ segments: validatedSegments });

  } catch (error) {
    console.error('Failed to segment content:', error);
    if (error instanceof OpenAI.APIError) {
      console.error('Venice API error:', {
        status: error.status,
        message: error.message
      });
    }
    return NextResponse.json(
      { error: 'Failed to segment content' }, 
      { status: 500 }
    );
  }
} 