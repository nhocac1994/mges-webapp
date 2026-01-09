import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Forward Authorization header
    const authHeader = request.headers.get('authorization')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    const response = await fetch(`${API_URL}/api/issues/${params.id}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000), // Tăng timeout lên 30s cho kết nối VPS
    })

    if (!response.ok) {
      // Trả về 404 thay vì 500 để Next.js xử lý đúng
      return NextResponse.json(
        { success: false, message: 'Issue not found' },
        { status: 404 }
      )
    }

    const result = await response.json()
    // Backend trả về { success: true, data: issue }
    // Trả về data trực tiếp để frontend dùng
    return NextResponse.json(result.data || result, { status: 200 })
  } catch (error: any) {
    console.error('Error proxying to backend:', error)
    // Trả về 404 thay vì 500 để Next.js xử lý đúng
    return NextResponse.json(
      { success: false, message: 'Issue not found' },
      { status: 404 }
    )
  }
}

