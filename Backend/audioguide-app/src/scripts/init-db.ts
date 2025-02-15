import { Agent } from '@fileverse/agents'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function initDB() {
  try {
    // Verify required env vars
    if (!process.env.PRIVATE_KEY) throw new Error('PRIVATE_KEY is required')
    if (!process.env.PINATA_JWT) throw new Error('PINATA_JWT is required')
    if (!process.env.PINATA_GATEWAY) throw new Error('PINATA_GATEWAY is required')
    if (!process.env.PIMLICO_API_KEY) throw new Error('PIMLICO_API_KEY is required')

    const agent = new Agent({ 
      chain: 'sepolia',
      privateKey: process.env.PRIVATE_KEY!,
      pinataJWT: process.env.PINATA_JWT!,
      pinataGateway: process.env.PINATA_GATEWAY!,
      pimlicoAPIKey: process.env.PIMLICO_API_KEY!,
    })

    await agent.setupStorage('Unwrit')
    
    // Create initial DB with existing guides
    const dbContent = {
      guides: [
        {
          fileId: "4",
          creator: "0xd581d18d22f26b793fd92cccee718ed46e1350ea",
          timestamp: new Date().toISOString()
        },
        {
          fileId: "11",
          creator: "0xd581d18d22f26b793fd92cccee718ed46e1350ea",
          timestamp: new Date().toISOString()
        }
      ]
    }
    
    const file = await agent.create(JSON.stringify(dbContent, null, 2))
    console.log('='.repeat(50))
    console.log('DB File created successfully!')
    console.log(`DB_FILE_ID=${file.fileId}`)
    console.log('Content:', dbContent)
    console.log('='.repeat(50))
    return file.fileId
  } catch (error) {
    console.error('Failed to create DB:', error)
    process.exit(1)
  }
}

initDB() 