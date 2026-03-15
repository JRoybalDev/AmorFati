import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  let url = request.nextUrl.searchParams.get('url')
  if (!url) return new NextResponse('Missing url parameter', { status: 400 })

  url = url.replace(/^http:\/\//, 'https://')

  const apiKey = process.env.ARCON_API_KEY

  try {
    const response = await fetch(url, {
      headers: apiKey ? {
        'x-api-key': apiKey,
      } : undefined,
    })

    if (!response.ok) {
      return new NextResponse(response.statusText, { status: response.status })
    }

    const headers = new Headers()
    const contentType = response.headers.get('Content-Type')
    if (contentType) {
      headers.set('Content-Type', contentType)
    }
    headers.set('Cache-Control', 'public, max-age=3600')

    return new NextResponse(response.body, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
