import { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

// Proxy endpoint cho Socket.IO polling requests
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const queryString = searchParams.toString()
  
  try {
    const response = await fetch(`${API_URL}/socket.io/?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      return new Response(response.statusText, { status: response.status })
    }

    const data = await response.text()
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error: any) {
    console.error('Error proxying socket request:', error)
    return new Response('Error', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const queryString = searchParams.toString()
  const body = await request.text()
  
  try {
    const response = await fetch(`${API_URL}/socket.io/?${queryString}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: body,
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      return new Response(response.statusText, { status: response.status })
    }

    const data = await response.text()
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error: any) {
    console.error('Error proxying socket request:', error)
    return new Response('Error', { status: 500 })
  }
}

