import axios from 'axios'

export async function addLog(message: string) {
  try {
    // Use relative URL for client-side code
    await axios.post('/api/logs', {
      log: {
        timestamp: new Date().toISOString(),
        message
      }
    })
  } catch (error) {
    console.error('Failed to store log:', error)
  }
}

// For server-side code
export async function serverLog(message: string) {
  try {
    // Use absolute URL for server-side code
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