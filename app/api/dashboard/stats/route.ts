import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

/**
 * Proxy dashboard stats request to Node.js backend
 * Giống mẫu mu-online-react - dùng Next.js API routes để tránh CORS
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching dashboard stats from:', `${API_URL}/api/dashboard/stats`)
    console.log('API_URL:', API_URL)
    
    // Forward Authorization header từ request gốc
    const authHeader = request.headers.get('authorization')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    console.log('Forwarding dashboard stats request with auth:', !!authHeader)
    
    const response = await fetch(`${API_URL}/api/dashboard/stats`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000), // Tăng timeout lên 30s cho kết nối VPS
    })

    if (!response.ok) {
      // Trả về fallback data thay vì error để page vẫn render được
      console.warn(`Backend returned ${response.status}, using fallback data`)
      return NextResponse.json({
        totalReceivedMonth: 0,
        totalPendingMonth: 0,
        totalPendingAll: 0,
        totalCompletedMonth: 0,
      }, { status: 200 })
    }

    const result = await response.json()
    // Backend trả về { success: true, data: {...} }
    // Trả về data trực tiếp để frontend dùng
    return NextResponse.json(result.data || result, { status: 200 })
  } catch (error: any) {
    console.error('Error proxying dashboard stats:', error)
    console.error('API_URL:', API_URL)
    
    // Luôn trả về response hợp lệ với fallback data
    // Để tránh RSC payload error và page vẫn render được
    return NextResponse.json({
      totalReceivedMonth: 0,
      totalPendingMonth: 0,
      totalPendingAll: 0,
      totalCompletedMonth: 0,
      _error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 200 })
  }
}

