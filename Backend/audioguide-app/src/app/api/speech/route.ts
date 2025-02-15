import { NextResponse } from 'next/server'
import { ElevenLabsClient } from "elevenlabs"

export async function POST(request: Request) {
  try {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await request.json()

    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    })

    const audio = await client.textToSpeech.convert(voiceId, {
      text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })

    // Convert audio buffer to base64
    const audioBase64 = Buffer.from(audio).toString('base64')

    return NextResponse.json({ 
      audio: audioBase64 
    })
  } catch (error: any) {
    console.error('Speech generation failed:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
} 