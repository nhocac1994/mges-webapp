import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('Error proxying login to backend:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi kết nối đến server. Vui lòng thử lại sau.' 
      },
      { status: 500 }
    )
  }
}

