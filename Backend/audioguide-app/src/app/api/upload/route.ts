import { NextResponse } from 'next/server'
import { Agent } from '@fileverse/agents'

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
    
    const agent = initAgent()
    await agent.setupStorage('Unwrit')

    // Handle deletion
    if (action === 'delete' && fileId) {
      await agent.delete(BigInt(fileId))
      return NextResponse.json({ success: true })
    }

    // Create new file
    const file = await agent.create(content)
    console.log('Created file:', file)

    // Get the file to verify and return content
    const verifyFile = await agent.getFile(file.fileId)
    
    return NextResponse.json({ 
      fileId: file.fileId.toString(),
      content: verifyFile?.content || content,
      creator: walletAddress,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to upload:', error)
    return NextResponse.json({ error: 'Failed to upload content' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const agent = initAgent()
    await agent.setupStorage('Unwrit')

    // Scan first 20 files
    const guides = []
    for (let i = 0n; i < 20n; i++) {
      try {
        const file = await agent.getFile(i)
        if (file?.content) {
          const titleMatch = file.content.match(/^# (.*)/m)
          const title = titleMatch ? titleMatch[1] : 'Untitled Guide'
          const mainContent = file.content.replace(/^# .*\n/, '').trim()

          guides.push({
            fileId: i.toString(),
            title,
            content: mainContent,
            hash: file.contentIpfsHash
          })
        }
      } catch {
        // Skip non-existent files
      }
    }

    return NextResponse.json({ guides })
  } catch (error) {
    console.error('Failed to fetch guides:', error)
    return NextResponse.json({ guides: [] })
  }
} 