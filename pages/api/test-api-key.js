// Test API Key Endpoint
// This will help verify if the API key is working

export default async function handler(req, res) {
  console.log('Test API Key endpoint called:', req.method, req.body)
  
  // Support both GET and POST methods
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Hardcoded API key for testing
    const VALID_API_KEY = '29f0f66225272194c8529bd095720efa8fcfb55f236615c29c52334f8fbfcacc'
    
    if (req.method === 'GET') {
      // Return API key info for GET requests
      return res.status(200).json({
        success: true,
        message: 'Test API Key endpoint is working',
        validApiKey: VALID_API_KEY.substring(0, 8) + '...',
        fullApiKey: VALID_API_KEY,
        method: 'GET',
        instructions: {
          post: 'Send POST request with {"apiKey": "your-api-key"} to test validation',
          get: 'This GET request shows the valid API key'
        },
        timestamp: new Date().toISOString()
      })
    }
    
    // Handle POST requests
    const { apiKey } = req.body
    
    console.log('Received API key:', apiKey ? apiKey.substring(0, 8) + '...' : 'NOT PROVIDED')
    console.log('Expected API key:', VALID_API_KEY.substring(0, 8) + '...')
    console.log('API key match:', apiKey === VALID_API_KEY)
    
    if (apiKey === VALID_API_KEY) {
      return res.status(200).json({
        success: true,
        message: 'API key is valid',
        apiKeyProvided: apiKey ? apiKey.substring(0, 8) + '...' : 'NOT PROVIDED',
        apiKeyExpected: VALID_API_KEY.substring(0, 8) + '...',
        match: true,
        method: 'POST',
        timestamp: new Date().toISOString()
      })
    } else {
      return res.status(401).json({
        success: false,
        message: 'API key is invalid',
        apiKeyProvided: apiKey ? apiKey.substring(0, 8) + '...' : 'NOT PROVIDED',
        apiKeyExpected: VALID_API_KEY.substring(0, 8) + '...',
        match: false,
        method: 'POST',
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Test API key failed:', error)
    return res.status(500).json({ 
      error: 'Test failed', 
      details: error.message 
    })
  }
}
