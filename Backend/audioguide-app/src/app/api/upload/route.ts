import { NextResponse } from 'next/server'
import { Agent } from '@fileverse/agents'

// Initialize the Fileverse agent
const initAgent = () => {
  return new Agent({ 
    chain: process.env.CHAIN || 'gnosis',
    privateKey: process.env.PRIVATE_KEY || '',
    pinataJWT: process.env.PINATA_JWT || '',
    pinataGateway: process.env.PINATA_GATEWAY || '',
    pimlicoAPIKey: process.env.PIMLICO_API_KEY || '',
  })
}

export async function GET() {
  try {
    const agent = initAgent()
    await agent.setupStorage('DaVinci')
    const files = await agent.listFiles()
    return NextResponse.json({ files })
  } catch (error) {
    console.error('Failed to fetch files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { content, action, fileId, walletAddress } = await request.json()
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    const agent = initAgent()
    await agent.setupStorage(`DaVinci-${walletAddress}`, {
      owner: walletAddress,
      isPublic: false
    })

    if (action === 'delete' && fileId) {
      await agent.delete(BigInt(fileId))
      return NextResponse.json({ success: true })
    }

    // Create new file
    const file = await agent.create(content)
    console.log('Created file:', file)

    // Verify the file was created
    const verifyFile = await agent.getFile(file.fileId)
    console.log('Verified file:', verifyFile)

    return NextResponse.json({ 
      fileId: file.fileId.toString(),
      content: verifyFile?.content || content,
      owner: walletAddress
    })
  } catch (error) {
    console.error('Failed to upload:', error)
    return NextResponse.json(
      { error: 'Failed to upload content' },
      { status: 500 }
    )
  }
} 