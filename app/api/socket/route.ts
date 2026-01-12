import { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

// Proxy endpoint cho Socket.IO polling requests
// Socket.IO polling sử dụng query parameters với EIO version và transport
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const queryString = searchParams.toString()
  
  try {
    // Proxy request đến backend Socket.IO endpoint
    const backendURL = `${API_URL}/socket.io/?${queryString}`
    console.log(`[Socket Proxy] GET: ${backendURL}`)
    
    const response = await fetch(backendURL, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
      // Không set timeout quá ngắn vì Socket.IO polling có thể mất thời gian
      signal: AbortSignal.timeout(60000),
    })

    if (!response.ok) {
      console.error(`[Socket Proxy] Error: ${response.status} ${response.statusText}`)
      return new Response(response.statusText, { status: response.status })
    }

    const data = await response.text()
    
    // Copy headers từ backend response
    const contentType = response.headers.get('content-type') || 'text/plain'
    
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error: any) {
    console.error('[Socket Proxy] Error proxying GET request:', error.message)
    return new Response('Error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const queryString = searchParams.toString()
  const body = await request.text()
  
  try {
    // Proxy request đến backend Socket.IO endpoint
    const backendURL = `${API_URL}/socket.io/?${queryString}`
    console.log(`[Socket Proxy] POST: ${backendURL}`)
    
    const response = await fetch(backendURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Accept': '*/*',
      },
      body: body,
      signal: AbortSignal.timeout(60000),
    })

    if (!response.ok) {
      console.error(`[Socket Proxy] Error: ${response.status} ${response.statusText}`)
      return new Response(response.statusText, { status: response.status })
    }

    const data = await response.text()
    const contentType = response.headers.get('content-type') || 'text/plain'
    
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error: any) {
    console.error('[Socket Proxy] Error proxying POST request:', error.message)
    return new Response('Error', { status: 500 })
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
