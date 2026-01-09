import axios from 'axios'

// Sử dụng Next.js API routes để proxy (giống mẫu mu-online-react)
// Điều này giúp tránh CORS issues vì requests đi qua Next.js server trước
// Next.js server (server-side) sẽ gọi đến backend Node.js
const API_URL = '/api' // Dùng Next.js API routes để proxy

const api = axios.create({
  baseURL: API_URL, // Proxy qua Next.js API routes
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Thêm token vào header nếu có
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    // Nếu là FormData, không set Content-Type header (axios sẽ tự set với boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      // Nếu là 401 (Unauthorized), xóa token và redirect đến login
      if (error.response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(error.response.data)
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({ message: 'Không thể kết nối đến server' })
    } else {
      // Error setting up request
      return Promise.reject({ message: error.message })
    }
  }
)

export { api }

