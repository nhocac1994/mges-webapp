import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

/**
 * Proxy admin users requests to Node.js backend
 * GET /api/admin/users - Get all users
 * POST /api/admin/users - Create new user
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    
    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error proxying admin users request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')
    const body = await request.json()
    
    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error proxying create user request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}

