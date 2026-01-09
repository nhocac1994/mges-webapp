import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'

/**
 * Proxy image requests to Node.js backend
 * Giải quyết Mixed Content (HTTPS page không thể load HTTP images)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the path
    // params.path có thể là ['uploads', 'issue-xxx.webp'] hoặc ['issue-xxx.webp']
    let imagePath = '/' + params.path.join('/')
    
    // Loại bỏ duplicate /uploads nếu có (có thể có nhiều lần)
    // Ví dụ: /uploads/uploads/issue-xxx.webp → /uploads/issue-xxx.webp
    while (imagePath.startsWith('/uploads/uploads')) {
      imagePath = imagePath.replace('/uploads/uploads', '/uploads')
    }
    
    // Nếu chưa có /uploads, thêm vào
    if (!imagePath.startsWith('/uploads')) {
      imagePath = '/uploads' + imagePath
    }
    
    const imageUrl = `${API_URL}${imagePath}`
    console.log('Fetching image from:', imageUrl)
    console.log('Original path params:', params.path)
    console.log('Normalized path:', imagePath)
    
    // Fetch image from backend
    const response = await fetch(imageUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      console.error(`Image not found: ${imageUrl}, status: ${response.status}`)
      return new NextResponse('Image not found', { status: 404 })
    }

    // Get image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('Error proxying image:', error)
    console.error('Image path:', params.path)
    return new NextResponse('Error loading image', { status: 500 })
  }
}

