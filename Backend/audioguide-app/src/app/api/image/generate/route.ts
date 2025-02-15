import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const venice = new OpenAI({
  apiKey: process.env.VENICE_API_KEY || '',
  baseURL: "https://api.venice.ai/api/v1"
})

export async function POST(request: Request) {
  try {
    console.log('Using Venice API Key:', process.env.VENICE_API_KEY?.slice(0, 10) + '...')
    
    // Use createImage instead of images.generate
    const response = await venice.post('/image/generate', {
      prompt: "The British Museum in digital art style",
      model: "sdxl",
      n: 1,
      size: "1024x512"
    })

    console.log('Venice response:', response)

    if (response.data && response.data.images && response.data.images.length > 0) {
      return NextResponse.json({ imageUrl: response.data.images[0] })
    }

    throw new Error('No image generated')

  } catch (error) {
    console.error('Failed to generate image:', error)
    if (error instanceof OpenAI.APIError) {
      console.error('Status:', error.status)
      console.error('Message:', error.message)
      console.error('Full error:', error)
    }
    return NextResponse.json(
      { error: 'Failed to generate image' }, 
      { status: 500 }
    )
  }
} 