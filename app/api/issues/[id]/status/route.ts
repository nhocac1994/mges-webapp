import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Forward Authorization header
    const authHeader = request.headers.get('authorization')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    const response = await fetch(`${API_URL}/api/issues/${params.id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || `HTTP error! status: ${response.status}` }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorData.message || `Backend error: ${response.status}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error proxying PATCH to backend:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi kết nối đến server. Vui lòng thử lại sau.' 
      },
      { status: 500 }
    )
  }
}

