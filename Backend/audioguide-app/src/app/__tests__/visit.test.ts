import axios from 'axios'

// Test guide content
const testGuide = {
  title: "Museum Tour",
  content: "Welcome to the museum! This is a test guide."
}

// Test translation
const testTranslation = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/translate', {
      content: testGuide.content,
      targetLanguage: 'fr'
    })
    console.log('Translation:', response.data.translatedContent)
  } catch (error) {
    console.error('Translation failed:', error)
  }
}

// Test content processing
const testProcessing = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/process-content', {
      content: testGuide.content
    })
    console.log('Processed chunks:', response.data.chunks)
  } catch (error) {
    console.error('Processing failed:', error)
  }
}

// Run tests
const runTests = async () => {
  console.log('Testing translation...')
  await testTranslation()
  
  console.log('Testing content processing...')
  await testProcessing()
}

runTests() 