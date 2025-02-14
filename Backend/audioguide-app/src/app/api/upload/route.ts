import { NextResponse } from 'next/server'
import { Agent } from '@fileverse/agents'

// Initialize the Fileverse agent
const agent = new Agent({ 
  chain: process.env.NEXT_PUBLIC_CHAIN || 'gnosis',
  privateKey: process.env.PRIVATE_KEY,
  pinataJWT: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY,
  pimlicoAPIKey: process.env.PIMLICO_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { content, action, fileId } = await request.json()

    // Setup storage if not already set up
    await agent.setupStorage('audio-guides')

    if (action === 'delete' && fileId) {
      const result = await agent.delete(BigInt(fileId))
      // Convert BigInt values to strings before sending response
      return NextResponse.json({ 
        success: true, 
        result: {
          hash: result.hash,
          fileId: result.fileId.toString(),
          portalAddress: result.portalAddress
        }
      })
    }

    // Create file using Fileverse agent
    const file = await agent.create(content)
    console.log('File created:', file)

    // Get the file content after creation
    const fileContent = await agent.getFile(file.fileId)
    console.log('File content:', fileContent)

    return NextResponse.json({ 
      hash: file.hash,
      fileId: file.fileId.toString(),
      content: fileContent?.content || content,
      portalAddress: file.portalAddress
    })
  } catch (error) {
    console.error('Failed to upload using Fileverse:', error)
    return NextResponse.json(
      { error: 'Failed to upload content' },
      { status: 500 }
    )
  }
} 