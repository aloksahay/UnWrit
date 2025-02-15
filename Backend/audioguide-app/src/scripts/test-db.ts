import { Agent } from '@fileverse/agents'
import axios from 'axios'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

interface FileData {
  fileId: string;
  content: string;
  ipfsHash: string;
  timestamp: string;
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

async function testDB() {
  try {
    console.log('Using DB_FILE_ID:', process.env.DB_FILE_ID)
    
    const agent = new Agent({ 
      chain: 'sepolia',
      privateKey: process.env.PRIVATE_KEY!,
      pinataJWT: process.env.PINATA_JWT!,
      pinataGateway: process.env.PINATA_GATEWAY!,
      pimlicoAPIKey: process.env.PIMLICO_API_KEY!,
    })

    await agent.setupStorage('Unwrit')
    
    // Try to get the DB file directly
    const dbFile = await agent.getFile(BigInt(process.env.DB_FILE_ID!))
    console.log('\nDB File:', dbFile)
    
    if (dbFile?.contentIpfsHash) {
      console.log('\nFetching DB content from IPFS...')
      const db = await fetchIpfsContent(dbFile.contentIpfsHash)
      console.log('DB Content:', db)
      
      // Try to fetch one of the guides
      if (db.guides?.length > 0) {
        const guide = db.guides[0]
        console.log('\nTrying to fetch first guide:', guide)
        const guideFile = await agent.getFile(BigInt(guide.fileId))
        console.log('Guide file:', guideFile)
        
        if (guideFile?.contentIpfsHash) {
          const guideContent = await fetchIpfsContent(guideFile.contentIpfsHash)
          console.log('Guide content:', guideContent)
        }
      }
    } else {
      console.log('\nNo DB file found at ID', process.env.DB_FILE_ID)
      
      // List some files to help debug
      console.log('\nListing recent files:')
      for (let i = 10n; i < 20n; i++) {
        try {
          const file = await agent.getFile(i)
          if (file) {
            console.log(`\nFile ${i}:`)
            console.log('IPFS Hash:', file.contentIpfsHash)
            if (file.contentIpfsHash) {
              const content = await fetchIpfsContent(file.contentIpfsHash)
              console.log('Content:', content)
            }
          }
        } catch {
          // Skip non-existent files
        }
      }
    }
  } catch (error) {
    console.error('Failed to read files:', error)
    process.exit(1)
  }
}

testDB() 