import { NextResponse } from 'next/server'
import { Agent } from '@fileverse/agents'
import axios from 'axios'

async function serverLog(message: string) {
  try {
    await fetch('http://localhost:3000/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log: {
          timestamp: new Date().toISOString(),
          message
        }
      })
    })
  } catch (error) {
    console.error('Failed to store log:', error)
  }
}

async function fetchIpfsContent(ipfsHash: string): Promise<any> {
  const hash = ipfsHash.replace('ipfs://', '')
  const gateway = process.env.PINATA_GATEWAY
  const jwt = process.env.PINATA_JWT
  
  const response = await axios.get(`https://${gateway}/ipfs/${hash}`, {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  })
  return response.data
}

const initAgent = () => {
  return new Agent({ 
    chain: 'sepolia',
    privateKey: process.env.PRIVATE_KEY!,
    pinataJWT: process.env.PINATA_JWT!,
    pinataGateway: process.env.PINATA_GATEWAY!,
    pimlicoAPIKey: process.env.PIMLICO_API_KEY!,
  })
}

// In-memory store for guides
let guides: Array<{
  fileId: string;
  title: string;
  content: string;
  ipfsHash: string;
  creator: string;
  timestamp: string;
}> = []

// Temporary function to add a guide (call this from upload API)
export function addGuide(guide: any) {
  guides.push(guide)
  console.log('Guide added to memory. Current guides:', guides)
}

export async function GET(request: Request) {
  console.log('GET /api/guides - Current guides in memory:', guides)
  return NextResponse.json({ guides })
}