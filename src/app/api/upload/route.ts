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
    // Endpoint: /api/:projectname/upload/images/:folder
    const folder = 'Posts/Images'
    const response = await fetch(`http://arcon-api.duckdns.org:7777/api/AmorFati/upload/images/${encodeURIComponent(folder)}`, {
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
    let url = ''

    try {
      const data = await response.json()
      if (data?.file?.url) {
        url = data.file.url
      } else if (data?.url) {
        url = data.url
      }
      if (data?.file?.filename) {
        filename = data.file.filename
      } else if (data?.filename) {
        filename = data.filename
      }
    } catch (e) {
      // Response might not be JSON
    }

    // Construct the public URL
    if (!url) {
      url = `http://arcon-api.duckdns.org:7777/content/AmorFati/Posts/Images/${filename}`
    }

    // Proxy the URL through our backend to include the API key
    return NextResponse.json({ url: `/api/proxy?url=${encodeURIComponent(url)}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}
