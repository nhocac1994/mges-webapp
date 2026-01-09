import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

/**
 * Proxy issues requests to Node.js backend
 * Giống mẫu mu-online-react - dùng Next.js API routes để tránh CORS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const url = queryString 
      ? `${API_URL}/api/issues?${queryString}`
      : `${API_URL}/api/issues`
    
    console.log('Fetching issues from:', url)
    console.log('API_URL:', API_URL)
    
    // Forward Authorization header từ request gốc
    const authHeader = request.headers.get('authorization')
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    console.log('Forwarding request with auth:', !!authHeader)
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000), // Tăng timeout lên 30s cho kết nối VPS
    })

    if (!response.ok) {
      // Trả về empty data thay vì error để page vẫn render được
      console.warn(`Backend returned ${response.status}, using fallback data`)
      return NextResponse.json({
        data: [],
        totalPages: 0,
        currentPage: 1,
        totalItems: 0,
      }, { status: 200 })
    }

    const result = await response.json()
    // Backend trả về { success: true, data: { data: [...], totalPages: ... } }
    // Trả về data trực tiếp để frontend dùng
    if (result.success && result.data) {
      return NextResponse.json(result.data, { status: 200 })
    }
    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('Error proxying to backend:', error)
    console.error('API_URL:', API_URL)
    
    // Luôn trả về response hợp lệ với empty data
    // Để tránh RSC payload error và page vẫn render được
    return NextResponse.json({
      data: [],
      totalPages: 0,
      currentPage: 1,
      totalItems: 0,
      _error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    console.log('POST request contentType:', contentType)
    console.log('API_URL:', API_URL)
    
    // Kiểm tra nếu là multipart/form-data (file upload)
    if (contentType.includes('multipart/form-data')) {
      // Forward FormData trực tiếp đến backend
      const formData = await request.formData()
      
      // Log form data keys để debug (tương thích với TypeScript)
      const formDataKeys: string[] = []
      formData.forEach((value, key) => {
        if (!formDataKeys.includes(key)) {
          formDataKeys.push(key)
        }
      })
      console.log('FormData keys:', formDataKeys)
      
      // Forward Authorization header
      const authHeader = request.headers.get('authorization')
      const headers: HeadersInit = {}
      if (authHeader) {
        headers['Authorization'] = authHeader
      }
      
      const response = await fetch(`${API_URL}/api/issues`, {
        method: 'POST',
        headers,
        body: formData, // Forward FormData trực tiếp, không set Content-Type header (browser sẽ tự set với boundary)
        signal: AbortSignal.timeout(30000),
      })

      console.log('Backend response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error response:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText || `HTTP error! status: ${response.status}` }
        }
        
        return NextResponse.json(
          { 
            success: false, 
            message: errorData.message || errorData.error || `Backend error: ${response.status}`,
            error: process.env.NODE_ENV === 'development' ? errorData : undefined
          },
          { status: response.status }
        )
      }

      const data = await response.json()
      console.log('Backend success response:', data)
      return NextResponse.json(data, { status: response.status })
    } else {
      // Xử lý JSON request
      const body = await request.json()
      console.log('JSON body:', body)
      
      // Forward Authorization header
      const authHeader = request.headers.get('authorization')
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (authHeader) {
        headers['Authorization'] = authHeader
      }
      
      const response = await fetch(`${API_URL}/api/issues`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      })

      console.log('Backend response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error response:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText || `HTTP error! status: ${response.status}` }
        }
        
        return NextResponse.json(
          { 
            success: false, 
            message: errorData.message || errorData.error || `Backend error: ${response.status}`,
            error: process.env.NODE_ENV === 'development' ? errorData : undefined
          },
          { status: response.status }
        )
      }

      const data = await response.json()
      console.log('Backend success response:', data)
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error: any) {
    console.error('Error proxying POST to backend:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi kết nối đến server. Vui lòng thử lại sau.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

