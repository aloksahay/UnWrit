'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { TrashIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface Guide {
  fileId: string;
  title: string;
  content: string;
  ipfsHash: string;
  creator: string;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [guides, setGuides] = useState<Guide[]>([])
  const [isDeployingAgent, setIsDeployingAgent] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  useEffect(() => {
    // Check if user is connected
    const address = localStorage.getItem('walletAddress')
    if (!address) {
      router.push('/')
      return
    }
    setWalletAddress(address)
    
    // Fetch existing guides
    fetchExistingGuides()
  }, [router])

  useEffect(() => {
    if (walletAddress) {
      fetchExistingGuides()
    }
  }, [walletAddress])

  const fetchExistingGuides = async () => {
    try {
      // Get guides from localStorage
      const guides = JSON.parse(localStorage.getItem('guides') || '[]')
      setGuides(guides)
    } catch (error) {
      console.error('Failed to fetch guides:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const uploadToIPFS = async (content: string) => {
    try {
      const walletAddress = localStorage.getItem('walletAddress')
      if (!walletAddress) throw new Error('No wallet connected')

      const response = await axios.post('/api/upload', { 
        content,
        walletAddress 
      })

      // Save guide to localStorage
      const guides = JSON.parse(localStorage.getItem('guides') || '[]')
      guides.push(response.data)
      localStorage.setItem('guides', JSON.stringify(guides))

      return response.data
    } catch (error) {
      console.error('Failed to upload to IPFS:', error)
      throw new Error('Failed to upload to IPFS')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    try {
      setIsSubmitting(true)
      const markdownContent = `# ${title}\n\n${content}`
      
      const { fileId } = await uploadToIPFS(markdownContent)
      console.log('File uploaded:', { fileId })

      // After successful upload, fetch all guides again
      await fetchExistingGuides()
      
      setTitle('')
      setContent('')
      alert('Guide preview created and stored successfully!')
    } catch (error) {
      console.error('Failed to create guide:', error)
      alert('Failed to create guide preview')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (fileId: string, index: number) => {
    if (!confirm('Are you sure you want to delete this guide?')) return

    try {
      const walletAddress = localStorage.getItem('walletAddress')
      if (!walletAddress) {
        alert('Wallet not connected')
        return
      }

      const response = await axios.post('/api/upload', { 
        action: 'delete',
        fileId,
        walletAddress
      })

      if (response.data.success) {
        // Remove from localStorage
        const guides = JSON.parse(localStorage.getItem('guides') || '[]')
        const updatedGuides = guides.filter((g: Guide) => g.fileId !== fileId)
        localStorage.setItem('guides', JSON.stringify(updatedGuides))
        
        setGuides(prev => prev.filter((_, i) => i !== index))
        alert('Guide deleted successfully!')
      }
    } catch (error) {
      console.error('Failed to delete guide:', error)
      alert('Failed to delete guide')
    }
  }

  const deployGuideAgent = async () => {
    if (guides.length === 0) {
      alert('Please create at least one guide before deploying an agent')
      return
    }

    try {
      setIsDeployingAgent(true)

      const response = await axios.post('/api/deploy-agent', { guides })

      if (response.data.success) {
        alert('Guide Agent deployed successfully!')
      } else {
        throw new Error(response.data.error || 'Failed to deploy agent')
      }
    } catch (error) {
      console.error('Failed to deploy guide agent:', error)
      alert('Failed to deploy guide agent')
    } finally {
      setIsDeployingAgent(false)
    }
  }

  const generateImage = async () => {
    try {
      setIsGeneratingImage(true)
      const response = await axios.post('/api/generate-image', {
        prompt: content // Use the guide content as the prompt
      })
      
      if (response.data.images && response.data.images.length > 0) {
        setGeneratedImage(response.data.images[0])
      }
    } catch (error) {
      console.error('Failed to generate image:', error)
      alert('Failed to generate image')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">
          No wallet connected. Redirecting...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm mr-2">
                  {walletAddress?.slice(2, 4)}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('walletAddress')
                  router.push('/')
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Disconnect
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Preview Guide Content
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    placeholder="Write your guide content here. This will be converted to an audio guide later."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Preview...' : 'Create Preview'}
                </button>
                <button
                  type="button"
                  onClick={generateImage}
                  disabled={isGeneratingImage || !content}
                  className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-md 
                    hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-green-500 disabled:opacity-50"
                >
                  {isGeneratingImage ? 'Generating Image...' : 'Generate Image'}
                </button>
              </form>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Guide Previews
                </h2>
                <button
                  onClick={deployGuideAgent}
                  disabled={isDeployingAgent || guides.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                    disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isDeployingAgent ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      <span>Deploying Agent...</span>
                    </>
                  ) : (
                    <>
                      <span>🤖</span>
                      <span>Deploy Guide Agent</span>
                    </>
                  )}
                </button>
              </div>
              {guides.length === 0 ? (
                <div className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No guide previews created yet
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guides.map((guide, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">
                        {guide.content}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <div className="flex justify-between items-center">
                          <span>Created: {new Date(guide.timestamp).toLocaleDateString()}</span>
                          {guide.ipfsHash && (
                            <span className="text-indigo-600 dark:text-indigo-400">
                              Hash: {guide.ipfsHash.slice(0, 6)}...{guide.ipfsHash.slice(-4)}
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => guide.fileId && handleDelete(guide.fileId, index)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border-2 border-gray-200 dark:border-gray-600 hover:border-red-200 dark:hover:border-red-800"
                            disabled={!guide.fileId}
                            title="Delete Guide"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {generatedImage && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Generated Image</h3>
                <div className="relative w-full aspect-square">
                  <Image
                    src={`data:image/png;base64,${generatedImage}`}
                    alt="Generated image"
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 