/**
 * Compress and resize image before upload
 * Tự động resize và compress ảnh để giảm kích thước file
 */

interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeMB?: number
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    maxSizeMB = 2
  } = options

  return new Promise((resolve, reject) => {
    // Nếu file đã nhỏ hơn maxSizeMB, không cần compress
    if (file.size <= maxSizeMB * 1024 * 1024) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Tính toán kích thước mới
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        // Tạo canvas để resize và compress
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Cannot get canvas context'))
          return
        }

        // Vẽ ảnh đã resize lên canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Convert sang blob với quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // Nếu vẫn còn lớn, giảm quality thêm
            if (blob.size > maxSizeMB * 1024 * 1024) {
              let currentQuality = quality
              const reduceQuality = () => {
                currentQuality -= 0.1
                canvas.toBlob(
                  (newBlob) => {
                    if (!newBlob) {
                      reject(new Error('Failed to compress image'))
                      return
                    }
                    if (newBlob.size <= maxSizeMB * 1024 * 1024 || currentQuality <= 0.3) {
                      const compressedFile = new File(
                        [newBlob],
                        file.name,
                        { type: 'image/jpeg', lastModified: Date.now() }
                      )
                      resolve(compressedFile)
                    } else {
                      reduceQuality()
                    }
                  },
                  'image/jpeg',
                  currentQuality
                )
              }
              reduceQuality()
            } else {
              const compressedFile = new File(
                [blob],
                file.name,
                { type: 'image/jpeg', lastModified: Date.now() }
              )
              resolve(compressedFile)
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

