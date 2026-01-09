import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

/**
 * Proxy admin user update requests to Node.js backend
 * PUT /api/admin/users/:id - Update user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')
    const body = await request.json()
    
    const response = await fetch(`${API_URL}/api/admin/users/${params.id}`, {
      method: 'PUT',
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
    console.error('Error proxying update user request:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}

