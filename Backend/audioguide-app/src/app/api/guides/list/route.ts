import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  try {
    const gateway = process.env.PINATA_GATEWAY
    const ipfsHash = process.env.IPFS_CONTENT

    // Debug log to check env variables
    console.log('Environment variables:', {
      gateway,
      ipfsHash,
      expected: 'bafkreihgzmvltvv6uid2qiums72b23ltolc7hs7mcgkgb5yxi2xo2fn4ym'
    })
    
    if (!gateway || !ipfsHash) {
      console.error('Missing required env variables:', { gateway, ipfsHash })
      return NextResponse.json({ guides: [] })
    }

    const url = `https://${gateway}/ipfs/${ipfsHash}`
    console.log('Fetching from URL:', url)
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      }
    })

    const content = response.data
    
    // Create a guide from the content
    const titleMatch = content.match(/^# (.*)/m)
    const title = titleMatch ? titleMatch[1] : 'Untitled Guide'
    const mainContent = content.replace(/^# .*\n/, '').trim()

    const guide = {
      fileId: '1',
      title,
      content: mainContent,
      ipfsHash,
      timestamp: new Date().toISOString()
    }

    console.log('Returning guide:', guide)
    return NextResponse.json({ guides: [guide] })

  } catch (error) {
    console.error('Failed to fetch guide:', error)
    if (axios.isAxiosError(error)) {
      console.error('URL:', error.config?.url)
      console.error('Status:', error.response?.status)
      console.error('Response:', error.response?.data)
    }
    return NextResponse.json({ guides: [] })
  }
} 