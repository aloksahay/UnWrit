import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    // For now, skip Venice AI and just return content as a single chunk
    return NextResponse.json({ 
      chunks: [content]
    })

    /* Commented out Venice AI integration for now
    // Process content with Venice AI
    const response = await axios.post(
      'https://api.venice.ai/api/v1/text/process',
      {
        text: content,
        task: "summarize",
        style: "tour_guide",
        max_chunks: 5,
        chunk_size: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return NextResponse.json({ 
      chunks: response.data.chunks 
    })
    */
  } catch (error) {
    console.error('Failed to process content:', error)
    
    // Return content as a single chunk
    return NextResponse.json({ 
      chunks: [content]
    })
  }
} 