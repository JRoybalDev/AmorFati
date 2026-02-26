import { NextResponse } from 'next/server'

const FILE_API_URL = process.env.FILE_API_URL || 'http://localhost:4000'
const PROJECT_NAME = process.env.PROJECT_NAME || 'default'
const ARCON_API_KEY = process.env.ARCON_API_KEY || ''

export async function POST(request: Request) {
  console.log('[Upload API] Starting upload request processing')
  try {
    const data = await request.formData()
    const files: File[] | null = data.getAll('file') as unknown as File[]
    const path = data.get('path') as string | null // Get the path from the form data

    if (path) {
      console.log(`[Upload API] Target path from client: ${path}`)
    }

    console.log(`[Upload API] Received ${files?.length || 0} files`)

    if (!files || files.length === 0) {
      console.warn('[Upload API] No files found in request')
      return NextResponse.json({ success: false, message: 'No files found' }, { status: 400 })
    }

    if (files.length > 5) {
      console.warn(`[Upload API] Too many files: ${files.length}`)
      return NextResponse.json({ success: false, message: 'Too many files (max 5)' }, { status: 400 })
    }

    // The path from the client is the full folder path (e.g., /Posts/Images/some-id).
    // We use it directly. If it's not provided, we generate a new one.
    let folderPath = path || `Posts/Images/${Date.now()}-${Math.random().toString(36).substring(7)}`
    // Defensively trim any leading slash to prevent double slashes in the final URL.
    if (folderPath.startsWith('/')) {
      folderPath = folderPath.substring(1)
    }
    console.log(`[Upload API] Using folder path: ${folderPath}`)

    // 1. Create folder in external API. We'll pass the full desired path.
    const createFolderUrl = `${FILE_API_URL}/api/${PROJECT_NAME}/upload/folder`
    console.log(`[Upload API] Creating folder at external API: ${createFolderUrl}`)

    const folderRes = await fetch(createFolderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ARCON_API_KEY
      },
      body: JSON.stringify({ folder: folderPath }), // Use folderPath here
    })

    console.log(`[Upload API] Create folder response status: ${folderRes.status}`)

    if (!folderRes.ok) {
      const errorText = await folderRes.text()
      // A 409 Conflict status likely means the folder already exists, which is fine.
      if (folderRes.status !== 409) {
        console.error(`[Upload API] Failed to create folder. Response: ${errorText}`)
        throw new Error(`Failed to create folder in external API: ${errorText}`)
      } else {
        console.log(`[Upload API] Folder already exists or conflict occurred, proceeding with upload.`)
      }
    }

    // 2. Upload files to that folder using mass upload endpoint
    console.log('[Upload API] Starting file uploads to folder...')

    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    // The external API expects the destination path in the form data.
    formData.append('folder', folderPath)

    const uploadUrl = `${FILE_API_URL}/api/${PROJECT_NAME}/upload/mass`
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'x-api-key': ARCON_API_KEY
      },
      body: formData,
    })

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text()
      console.error(`[Upload API] Failed to upload files. Response: ${errorText}`)
      throw new Error(`Failed to upload files: ${errorText}`)
    }

    // The external API is the source of truth for the final URLs after its own sanitization.
    // We parse its response and forward it to the client.
    const uploadedUrls = await uploadRes.json()

    console.log(`[Upload API] Successfully processed uploads. Returning URLs from external API:`, uploadedUrls)
    // Return the array of full URLs provided by the external API.
    return NextResponse.json(uploadedUrls)
  } catch (error) {
    console.error('[Upload API] Critical error uploading files:', error)
    return NextResponse.json({ success: false, message: (error as Error).message || 'Upload failed' }, { status: 500 })
  }
}
