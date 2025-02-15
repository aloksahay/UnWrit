import { NextResponse } from 'next/server'
import { GameAgent } from "@virtuals-protocol/game"

export async function POST(request: Request) {
  try {
    const { guides } = await request.json()

    if (!guides || guides.length === 0) {
      return NextResponse.json(
        { error: 'No guides provided' },
        { status: 400 }
      )
    }

    // Create a worker that knows about the guides
    const guideWorker = {
      id: "davinci_worker",
      name: "DaVinci Knowledge Worker",
      description: "Worker that holds knowledge about the DaVinci guides",
      knowledge: guides.map(guide => ({
        title: guide.title,
        content: guide.content,
        fileId: guide.fileId,
        hash: guide.hash
      }))
    }

    // Create the Game agent
    const agent = new GameAgent(process.env.GAME_API_KEY, {
      name: "DaVinci Assistant",
      goal: "Help users understand and access DaVinci guides",
      description: "An agent that helps users navigate and understand the available guides",
      workers: [guideWorker],
    })

    await agent.init()
    
    return NextResponse.json({ 
      success: true,
      message: 'DaVinci Agent deployed successfully'
    })
  } catch (error) {
    console.error('Failed to deploy agent:', error)
    return NextResponse.json(
      { error: 'Failed to deploy agent' },
      { status: 500 }
    )
  }
} 