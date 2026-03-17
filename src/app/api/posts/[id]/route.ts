import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fileApiFetch } from '@/lib/fileApiAuth'

const FILE_API_URL = process.env.FILE_API_URL || ''
const PROJECT_NAME = process.env.PROJECT_NAME || 'default'
const ARCON_API_KEY = process.env.ARCON_API_KEY || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

function rewriteImageUrls(images: unknown): string[] {
  if (!Array.isArray(images)) return []
  return images.map((url) => {
    if (typeof url === 'string') {
      try {
        const urlObj = new URL(url)
        const fileApiObj = new URL(FILE_API_URL)
        if (urlObj.hostname === fileApiObj.hostname && urlObj.port === fileApiObj.port) {
          return `${APP_URL}/api/proxy?url=${encodeURIComponent(url)}`
        }
      } catch {
        // not a valid URL, return as-is
      }
    }
    return url
  })
}

function restoreImageUrls(images: unknown): string[] {
  if (!Array.isArray(images)) return []
  return images.map((url) => {
    if (typeof url === 'string' && url.includes('/api/proxy?url=')) {
      try {
        const parsed = new URL(url, 'http://localhost')
        const original = parsed.searchParams.get('url')
        if (original) return original
      } catch {
        // ignore
      }
    }
    return url
  })
}

async function deleteFiles(urls: string[]) {
  if (!urls || urls.length === 0) {
    return
  }

  if (!ARCON_API_KEY) {
    const errorMessage =
      '[File Cleanup] ARCON_API_KEY is not set. Cannot delete files.'
    console.error(errorMessage)
    throw new Error('File storage API key is not configured on the server.')
  }

  const filesToDelete = urls
    .map((url) => {
      try {
        const urlObj = new URL(url)
        const basePath = `/content/${PROJECT_NAME}/`
        if (urlObj.pathname.startsWith(basePath)) {
          const filePath = decodeURIComponent(
            urlObj.pathname.substring(basePath.length)
          )
          // The external API expects this specific object structure.
          return { source: 'local', id: filePath }
        }
      } catch {
        console.error(
          `[File Cleanup] Invalid URL format, cannot parse for deletion: ${url}`
        )
      }
      return null
    })
    .filter((item): item is { source: string; id: string } => item !== null)

  if (filesToDelete.length === 0) {
    console.warn('[File Cleanup] No valid files to delete from the provided URLs.')
    return
  }

  const res = await fileApiFetch(
    `/api/${PROJECT_NAME}/upload/files`,
    {
      method: 'DELETE',
      body: JSON.stringify({ files: filesToDelete }),
    }
  )

  if (!res.ok) {
    const errorText = await res.text()
    console.error(
      `[File Cleanup] API failed to delete files. Status: ${res.status}, Body: ${errorText}`
    )
    throw new Error(`Failed to delete files from storage. Status: ${res.status}`) 
  }

  console.log(
    `[File Cleanup] Successfully requested deletion of ${filesToDelete.length} files.`
  )
}

async function deleteFolder(folderPath: string) {
  if (!folderPath) return

  if (!ARCON_API_KEY) {
    const errorMessage =
      '[File Cleanup] ARCON_API_KEY is not set. Cannot delete folder.'
    console.error(errorMessage)
    throw new Error('File storage API key is not configured on the server.')
  }

  const res = await fileApiFetch(
    `/api/${PROJECT_NAME}/upload/folder`,
    {
      method: 'DELETE',
      body: JSON.stringify({ folder: folderPath }),
    }
  )

  if (!res.ok) {
    const errorText = await res.text()
    console.error(
      `[File Cleanup] API failed to delete folder '${folderPath}'. Status: ${res.status}, Body: ${errorText}`
    )
    throw new Error(
      `Failed to delete folder from storage. Status: ${res.status}`
    )
  }
  console.log(
    `[File Cleanup] Successfully requested deletion of folder: ${folderPath}`
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ ...post, images: rewriteImageUrls(post.images) })

  } catch {
    return NextResponse.json({ error: 'Error fetching post' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    let {
      type,
      title,
      content,
      images,
      link,
      rating,
      year,
      filmTitle,
      tags,
      showDetails,
    } = body

    // Restore original URLs from proxy URLs
    images = restoreImageUrls(images)

    // Fetch existing post to compare images
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { images: true },
    })

    const post = await prisma.post.update({
      where: { id },
      data: {
        type,
        title,
        content,
        images,
        link,
        rating,
        year,
        filmTitle,
        tags,
        showDetails,
      },
    })

    // Detect and delete removed images
    if (existingPost?.images && images) {
      const newImagesSet = new Set(images)
      const removedImages = existingPost.images.filter(
        (img) => !newImagesSet.has(img as string)
      )

      if (removedImages.length > 0) {
        await deleteFiles(removedImages as string[])
      }
    }

    return NextResponse.json({ ...post, images: rewriteImageUrls(post.images) })

  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // First, find the post to get its details for cleanup.
    const post = await prisma.post.findUnique({
      where: { id },
      select: { type: true, images: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Step 1: Attempt to delete associated files/folders from the external storage.
    // By doing this first, we reduce the chance of orphaned files.
    // If file deletion fails, the whole request fails and can be retried.
    if (post.type === 'IMAGE') {
      // For IMAGE posts, the convention is that all images are in a dedicated folder.
      // We try to detect the folder path from the images if available, otherwise fallback to default.
      let folderPath = `Posts/Images/${id}`

      if (Array.isArray(post.images) && post.images.length > 0) {
        const firstImage = post.images[0]
        if (typeof firstImage === 'string') {
          try {
            const urlObj = new URL(firstImage)
            const basePath = `/content/${PROJECT_NAME}/`
            if (urlObj.pathname.startsWith(basePath)) {
              const fullPath = decodeURIComponent(urlObj.pathname.substring(basePath.length))
              const lastSlashIdx = fullPath.lastIndexOf('/')
              if (lastSlashIdx > 0) {
                folderPath = fullPath.substring(0, lastSlashIdx)
              }
            }
          } catch { }
        }
      }
      await deleteFolder(folderPath)
    } else if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      // For other post types (like FILM), delete the specific files listed.
      await deleteFiles(post.images as string[])
    }

    // Step 2: If file cleanup was successful, delete the post from the database.
    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Post and associated files deleted successfully',
    })
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error)
    return NextResponse.json({ error: `Failed to delete post: ${(error as Error).message}` }, { status: 500 })
  }
}
