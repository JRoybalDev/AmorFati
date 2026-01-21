import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const backendFormData = new FormData()
    backendFormData.append('file', file, file.name)

    // Retrieve the API key from environment variables
    const apiKey = process.env.ARCON_API_KEY

    // Upload to the external backend
    // We assume the upload endpoint follows the convention /upload/file/{folder}
    const response = await fetch('http://arcon-api.duckdns.org:7777/api/AmorFati/upload/file/Posts', {
      method: 'POST',
      headers: apiKey ? {
        'x-api-key': apiKey, // Replace with the actual header name required by your backend
      } : undefined,
      body: backendFormData,
    })
    console.log(response)
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to upload to external server' },
        { status: response.status }
      )
    }

    // Try to get the filename from the response, otherwise use the original name
    let filename = file.name
    try {
      const data = await response.json()
      if (data?.filename) {
        filename = data.filename
      }
    } catch (e) {
      // Response might not be JSON
    }

    // Construct the public URL
    const url = `http://arcon-api.duckdns.org:7777/api/AmorFati/images/file/Posts/${filename}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}
