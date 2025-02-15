import { NextResponse } from 'next/server'
import { Agent } from '@fileverse/agents'
import { addGuide } from '../guides/route'

// In-memory store for guides
let guides: Array<{
  fileId: string;
  title: string;
  content: string;
  ipfsHash: string;
  creator: string;
  timestamp: string;
}> = []

const initAgent = () => {
  return new Agent({ 
    chain: 'sepolia',
    privateKey: process.env.PRIVATE_KEY!,
    pinataJWT: process.env.PINATA_JWT!,
    pinataGateway: process.env.PINATA_GATEWAY!,
    pimlicoAPIKey: process.env.PIMLICO_API_KEY!,
  })
}

export async function POST(request: Request) {
  try {
    const { content, action, fileId, walletAddress } = await request.json()
    console.log('POST /api/upload - Received content:', content)
    
    const agent = initAgent()
    await agent.setupStorage('Unwrit')

    // Handle deletion
    if (action === 'delete' && fileId) {
      await agent.delete(BigInt(fileId))
      return NextResponse.json({ success: true })
    }

    // Create new file
    const file = await agent.create(content)
    console.log('File created:', file)
    
    // Get title from content
    const titleMatch = content.match(/^# (.*)/m)
    const title = titleMatch ? titleMatch[1] : 'Untitled Guide'
    const mainContent = content.replace(/^# .*\n/, '').trim()

    // Create guide object
    const guide = {
      fileId: file.fileId.toString(),
      title,
      content: mainContent,
      ipfsHash: file.contentIpfsHash || '',
      creator: walletAddress,
      timestamp: new Date().toISOString()
    }

    console.log('Adding guide to memory:', guide)
    addGuide(guide)

    return NextResponse.json(guide)
  } catch (error) {
    console.error('Failed to upload:', error)
    return NextResponse.json({ error: 'Failed to upload content' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Return guides from our local store
    const formattedGuides = guides.map(guide => {
      const titleMatch = guide.content.match(/^# (.*)/m)
      const title = titleMatch ? titleMatch[1] : 'Untitled Guide'
      const mainContent = guide.content.replace(/^# .*\n/, '').trim()

      return {
        fileId: guide.fileId,
        title,
        content: mainContent,
        ipfsHash: guide.ipfsHash,
        createdAt: guide.timestamp,
        creator: guide.creator
      }
    })

    console.log(`Returning ${formattedGuides.length} guides from local store`)
    return NextResponse.json({ guides: formattedGuides })
  } catch (error) {
    console.error('Failed to fetch guides:', error)
    return NextResponse.json({ guides: [] })
  }
} 