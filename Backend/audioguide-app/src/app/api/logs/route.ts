import { NextResponse } from 'next/server'

// In-memory storage for logs (in production, you'd use a proper database)
let serverLogs: { timestamp: string; message: string }[] = []

export async function GET() {
  return NextResponse.json({ logs: serverLogs }, { headers: { 'no-log': 'true' } })
}

export async function POST(request: Request) {
  try {
    const { log } = await request.json()
    serverLogs.push(log)
    
    // Keep only last 100 logs
    if (serverLogs.length > 100) {
      serverLogs = serverLogs.slice(-100)
    }
    
    return NextResponse.json({ success: true }, { headers: { 'no-log': 'true' } })
  } catch (error) {
    console.error('Failed to store log:', error)
    return NextResponse.json(
      { error: 'Failed to store log' }, 
      { status: 500, headers: { 'no-log': 'true' } }
    )
  }
} 