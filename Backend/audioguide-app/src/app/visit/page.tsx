'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface Guide {
  fileId: string;
  title: string;
  content: string;
  ipfsHash: string;
  timestamp: string;
}

type Language = 'en' | 'fr' | 'es'

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

interface Segment {
  title: string;
  content: string;
  translatedContent?: string;
  isTranslating?: boolean;
}

export default function VisitPage() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [guides, setGuides] = useState<Guide[]>([])
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [segments, setSegments] = useState<Segment[]>([])
  const [isSegmenting, setIsSegmenting] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const address = localStorage.getItem('walletAddress')
    if (!address) {
      router.push('/')
      return
    }
    setWalletAddress(address)
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    fetchGuides()
  }, [])

  const fetchGuides = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get('/api/guides/list')
      if (response.data.guides) {
        setGuides(response.data.guides)
      }
    } catch (error) {
      console.error('Failed to fetch guides:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageSelect = async (lang: Language) => {
    console.log('Language selected:', lang);
    setSelectedLanguage(lang);
    
    if (selectedGuide && lang !== 'en') {
      setIsTranslating(true);
      try {
        const response = await axios.post('/api/process-guide', {
          content: selectedGuide.content,
          language: lang
        });
        
        if (response.data.translatedContent) {
          setSegments([{
            title: selectedGuide.title,
            content: selectedGuide.content,
            translatedContent: response.data.translatedContent
          }]);
        }
      } catch (error) {
        console.error('Failed to translate guide:', error);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleGuideClick = (guide: Guide) => {
    setSelectedGuide(guide);
    setSelectedLanguage('en');  // Default to English
    setSegments([{
      title: guide.title,
      content: guide.content
    }]);
  }

  const handlePlayAudio = async (segment: Segment, segmentIndex: number) => {
    try {
      if (isPlaying === segmentIndex) {
        if (audioRef.current?.paused) {
          await audioRef.current?.play();
        } else {
          audioRef.current?.pause();
        }
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsPlaying(segmentIndex);
      
      const textToSpeak = selectedLanguage !== 'en' && segment.translatedContent
        ? segment.translatedContent
        : segment.content;

      const response = await axios.post('/api/text-to-speech', { 
        content: textToSpeak,
        language: selectedLanguage
      }, {
        responseType: 'blob'
      });

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('ended', () => {
        setIsPlaying(null);
        URL.revokeObjectURL(audioUrl);
      });

      audio.addEventListener('pause', () => {
        setAudioPlaying(null);
      });

      audio.addEventListener('play', () => {
        setAudioPlaying(segmentIndex);
      });

      await audio.play();

    } catch (error) {
      console.error('Failed to generate audio:', error);
      setIsPlaying(null);
      setAudioPlaying(null);
    }
  };

  if (isLoading) {
    return <div>Loading guides...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UnWrit Guide</h1>
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
                Available Guides
              </h2>
              {guides.length === 0 ? (
                <div className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No guides available yet
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {guides.map((guide) => (
                    <div
                      key={guide.fileId}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {guide.content}
                      </p>
                      {selectedGuide?.fileId === guide.fileId ? (
                        <div className="flex flex-wrap gap-2">
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => handleLanguageSelect(lang.code)}
                              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                                ${selectedLanguage === lang.code 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-indigo-500 hover:text-white'
                                }`}
                            >
                              <span className="mr-2 text-lg">{lang.flag}</span>
                              {lang.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGuideClick(guide)}
                          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Load Guide
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedGuide && selectedLanguage && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedGuide.title}
                </h2>
                
                {isTranslating || isSegmenting ? (
                  <div className="text-center py-4">
                    {isTranslating ? 'Translating...' : 'Organizing content...'}
                  </div>
                ) : segments.length > 0 ? (
                  <div className="space-y-8">
                    {segments.map((segment, index) => (
                      <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {selectedLanguage === 'en' ? segment.title : segment.translatedTitle || segment.title}
                            </h3>
                            {!segment.isTranslating && (
                              <button
                                onClick={() => handlePlayAudio(segment, index)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                                  audioPlaying === index 
                                    ? 'bg-red-500 hover:bg-red-600' 
                                    : 'bg-indigo-500 hover:bg-indigo-600'
                                }`}
                                title={audioPlaying === index ? 'Pause' : 'Play'}
                              >
                                {audioPlaying === index ? (
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="prose dark:prose-invert">
                          {selectedLanguage === 'en' ? segment.content : segment.translatedContent || segment.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prose dark:prose-invert">
                    {selectedGuide.content}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 