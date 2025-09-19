// Test Environment Variables API Endpoint
// This will help debug environment variable issues

export default async function handler(req, res) {
  console.log('Test Environment Variables API called:', req.method)
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check environment variables
    const envVars = {
      API_KEY_NEW: process.env.API_KEY_NEW ? 'SET' : 'NOT SET',
      API_KEY: process.env.API_KEY ? 'SET' : 'NOT SET',
      TREASURY_PRIVATE_KEY_NEW: process.env.TREASURY_PRIVATE_KEY_NEW ? 'SET' : 'NOT SET',
      TREASURY_PRIVATE_KEY: process.env.TREASURY_PRIVATE_KEY ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV
    }

    console.log('Environment variables status:', envVars)

    // Test API key values (without exposing them)
    const apiKeyNew = process.env.API_KEY_NEW
    const apiKeyOld = process.env.API_KEY
    
    const apiKeyInfo = {
      API_KEY_NEW_LENGTH: apiKeyNew ? apiKeyNew.length : 0,
      API_KEY_OLD_LENGTH: apiKeyOld ? apiKeyOld.length : 0,
      API_KEY_NEW_STARTS_WITH: apiKeyNew ? apiKeyNew.substring(0, 8) + '...' : 'NOT SET',
      API_KEY_OLD_STARTS_WITH: apiKeyOld ? apiKeyOld.substring(0, 8) + '...' : 'NOT SET'
    }

    return res.status(200).json({
      success: true,
      environment: envVars,
      apiKeyInfo: apiKeyInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test environment variables failed:', error)
    return res.status(500).json({ 
      error: 'Test failed', 
      details: error.message 
    })
  }
}
