import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

export async function GET(request: NextRequest) {
  try {
    // Forward Authorization header
    const authHeader = request.headers.get('authorization')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const response = await fetch(`${API_URL}/api/dashboard/department-details`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      console.warn(`Backend returned ${response.status}, using fallback data`)
      return NextResponse.json([], { status: 200 })
    }

    const result = await response.json()
    return NextResponse.json(result.data || result, { status: 200 })
  } catch (error: any) {
    console.error('Error proxying department-details:', error)
    return NextResponse.json([], { status: 200 })
  }
}

