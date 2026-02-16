import { NextResponse } from 'next/server'

const FILE_API_URL = process.env.FILE_API_URL || 'http://localhost:4000'
const PROJECT_NAME = process.env.PROJECT_NAME || 'default'
const ARCON_API_KEY = process.env.ARCON_API_KEY || ''

export async function POST(request: Request) {
  console.log('[Upload API] Starting upload request processing')
  try {
    const data = await request.formData()
    const files: File[] | null = data.getAll('file') as unknown as File[]

    console.log(`[Upload API] Received ${files?.length || 0} files`)

    if (!files || files.length === 0) {
      console.warn('[Upload API] No files found in request')
      return NextResponse.json({ success: false, message: 'No files found' }, { status: 400 })
    }

    if (files.length > 5) {
      console.warn(`[Upload API] Too many files: ${files.length}`)
      return NextResponse.json({ success: false, message: 'Too many files (max 5)' }, { status: 400 })
    }

    const folderName = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    console.log(`[Upload API] Generated folder name: ${folderName}`)

    // 1. Create folder in external API
    const createFolderUrl = `${FILE_API_URL}/api/${PROJECT_NAME}/upload/folder`
    console.log(`[Upload API] Creating folder at external API: ${createFolderUrl}`)

    const folderRes = await fetch(createFolderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ARCON_API_KEY
      },
      body: JSON.stringify({ folder: folderName }),
    })

    console.log(`[Upload API] Create folder response status: ${folderRes.status}`)

    if (!folderRes.ok) {
      const errorText = await folderRes.text()
      console.error(`[Upload API] Failed to create folder. Response: ${errorText}`)
      throw new Error('Failed to create folder in external API')
    }

    // 2. Upload files to that folder
    console.log('[Upload API] Starting file uploads to folder...')
    for (const file of files) {
      console.log(`[Upload API] Uploading file: ${file.name} (${file.size} bytes)`)
      const formData = new FormData()
      formData.append('file', file)

      const uploadUrl = `${FILE_API_URL}/api/${PROJECT_NAME}/upload/images/${folderName}`
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'x-api-key': ARCON_API_KEY
        },
        body: formData,
      })

      console.log(`[Upload API] Upload response for ${file.name}: ${uploadRes.status}`)
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text()
        console.error(`[Upload API] Failed to upload ${file.name}. Response: ${errorText}`)
      }
    }

    console.log(`[Upload API] Successfully processed uploads. Returning folder: ${folderName}`)
    return NextResponse.json({ url: folderName })
  } catch (error) {
    console.error('[Upload API] Critical error uploading files:', error)
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 })
  }
}
