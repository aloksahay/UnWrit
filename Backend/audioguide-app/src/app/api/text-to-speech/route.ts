import { NextResponse } from 'next/server'
import axios from 'axios'

// Map languages to ElevenLabs voice IDs
const VOICE_IDS = {
  en: '21m00Tcm4TlvDq8ikWAM', // English voice
  es: 'ErXwobaYiN019PkySvjV', // Spanish voice
  fr: 'MF3mGyEYCl7XYWbV9V6O'  // French voice
}

export async function POST(request: Request) {
  try {
    const { content, language = 'en' } = await request.json()
    
    // Get the appropriate voice ID for the language
    const voiceId = VOICE_IDS[language as keyof typeof VOICE_IDS] || VOICE_IDS.en

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: content,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    )

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    })

  } catch (error) {
    console.error('Failed to generate speech:', error)
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status)
      console.error('Message:', error.response?.data)
    }
    return NextResponse.json(
      { error: 'Failed to generate speech' }, 
      { status: 500 }
    )
  }
} 