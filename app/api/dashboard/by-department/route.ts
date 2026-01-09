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
    
    const response = await fetch(`${API_URL}/api/dashboard/by-department`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000), // Tăng timeout lên 30s cho kết nối VPS
    })

    if (!response.ok) {
      console.warn(`Backend returned ${response.status}, using fallback data`)
      return NextResponse.json([], { status: 200 })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error proxying by-department:', error)
    // Trả về empty array để page vẫn render được
    return NextResponse.json([], { status: 200 })
  }
}

