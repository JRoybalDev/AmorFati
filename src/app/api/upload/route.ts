import { NextResponse } from 'next/server'
import { getFileApiToken, invalidateToken } from '@/lib/fileApiAuth'

const FILE_API_URL = process.env.FILE_API_URL || 'http://localhost:4000'
const PROJECT_NAME = process.env.PROJECT_NAME || 'default'
const ARCON_API_KEY = process.env.ARCON_API_KEY || ''

async function fetchWithAuth(url: string, options: RequestInit): Promise<Response> {
  const token = await getFileApiToken()

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'x-api-key': ARCON_API_KEY,
      Authorization: `Bearer ${token}`,
    },
  })

  // Token expired — invalidate, refresh, and retry once
  if (res.status === 403) {
    invalidateToken()
    const freshToken = await getFileApiToken()

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'x-api-key': ARCON_API_KEY,
        Authorization: `Bearer ${freshToken}`,
      },
    })
  }

  return res
}

export async function POST(request: Request) {
  // console.log('[Upload API] Starting upload request processing')
  try {
    const data = await request.formData()
    const files: File[] | null = data.getAll('file') as unknown as File[]
    const path = data.get('path') as string | null

    // if (path) {
    //   console.log(`[Upload API] Target path from client: ${path}`)
    // }

    // console.log(`[Upload API] Received ${files?.length || 0} files`)

    if (!files || files.length === 0) {
      console.warn('[Upload API] No files found in request')
      return NextResponse.json({ success: false, message: 'No files found' }, { status: 400 })
    }

    if (files.length > 10) {
      console.warn(`[Upload API] Too many files: ${files.length}`)
      return NextResponse.json({ success: false, message: 'Too many files (max 10)' }, { status: 400 })
    }

    let folderPath = path || `Posts/Images/${Date.now()}-${Math.random().toString(36).substring(7)}`
    if (folderPath.startsWith('/')) {
      folderPath = folderPath.substring(1)
    }
    // console.log(`[Upload API] Using folder path: ${folderPath}`)

    // 1. Create folder — now includes JWT alongside API key
    const createFolderUrl = `${FILE_API_URL}/api/${PROJECT_NAME}/upload/folder`
    // console.log(`[Upload API] Creating folder at external API: ${createFolderUrl}`)

    const folderRes = await fetchWithAuth(createFolderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder: folderPath }),
    })

    // console.log(`[Upload API] Create folder response status: ${folderRes.status}`)

    if (!folderRes.ok) {
      const errorText = await folderRes.text()
      if (folderRes.status !== 409) {
        console.error(`[Upload API] Failed to create folder. Response: ${errorText}`)
        throw new Error(`Failed to create folder in external API: ${errorText}`)
      } else {
        // console.log(`[Upload API] Folder already exists, proceeding with upload.`)
      }
    }

    // 2. Upload files — now includes JWT alongside API key
    // Note: No Content-Type header — fetch sets it automatically with the
    // correct multipart boundary when the body is FormData.
    // console.log('[Upload API] Starting file uploads to folder...')

    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('folder', folderPath)

    const uploadUrl = `${FILE_API_URL}/api/${PROJECT_NAME}/upload/mass`
    const uploadRes = await fetchWithAuth(uploadUrl, {
      method: 'POST',
      body: formData,
    })

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text()
      console.error(`[Upload API] Failed to upload files. Response: ${errorText}`)
      throw new Error(`Failed to upload files: ${errorText}`)
    }

    const uploadedUrls = await uploadRes.json()

    // console.log(`[Upload API] Successfully processed uploads:`, uploadedUrls)
    return NextResponse.json(uploadedUrls)

  } catch (error) {
    console.error('[Upload API] Critical error uploading files:', error)
    return NextResponse.json(
      { success: false, message: (error as Error).message || 'Upload failed' },
      { status: 500 }
    )
  }
}
