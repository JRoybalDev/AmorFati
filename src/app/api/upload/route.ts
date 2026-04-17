import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const files: File[] | null = data.getAll('file') as unknown as File[]
    const path = data.get('path') as string | null

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: 'No files found' }, { status: 400 })
    }

    const folderPath = path || `AmorFati/Posts`

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            fetch_format: 'auto',
            quality: 'auto',
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) reject(error)
            else resolve({
              url: result?.secure_url,
              id: result?.public_id,
              originalName: file.name,
              success: true
            })
          }
        ).end(buffer)
      })
    })

    const results = await Promise.all(uploadPromises)

    return NextResponse.json({ success: true, results })

  } catch (error) {
    console.error('[Upload API] Critical error uploading files:', error)
    return NextResponse.json(
      { success: false, message: (error as Error).message || 'Upload failed' },
      { status: 500 }
    )
  }
}