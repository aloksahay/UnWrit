'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        alert('Please install MetaMask to use this app')
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })

      // Save the connected address
      const address = accounts[0]
      localStorage.setItem('walletAddress', address)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Audio Guide NFTs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to get started
        </p>
      </div>

      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg
          font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  )
} 