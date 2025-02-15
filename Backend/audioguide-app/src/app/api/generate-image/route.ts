import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    // Enhance the prompt for better image generation
    const enhancedPrompt = `High quality, detailed illustration of: ${prompt}. Professional, artistic, vibrant colors, 4k, highly detailed`
    
    const response = await axios.post(
      'https://api.venice.ai/api/v1/image/generate',
      {
        model: "sdxl-1.0", // Specify SDXL model
        prompt: enhancedPrompt,
        width: 1024,
        height: 1024,
        steps: 30,
        hide_watermark: false,
        return_binary: false,
        style_preset: "digital-art", // Add style preset
        negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy" // Add negative prompt
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('Image generation response:', response.data)

    return NextResponse.json({ 
      images: response.data.images,
      request: response.data.request,
      timing: response.data.timing
    })
  } catch (error: any) {
    console.error('Failed to generate image:', error.response?.data || error)
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.response?.data },
      { status: 500 }
    )
  }
} 