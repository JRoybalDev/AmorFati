import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const FILE_API_URL = process.env.FILE_API_URL || 'http://localhost:3000'
const PROJECT_NAME = process.env.PROJECT_NAME || 'default'
const ARCON_API_KEY = process.env.ARCON_API_KEY || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

function rewriteImageUrls(images: unknown): string[] {
  if (!Array.isArray(images)) return []
  return images.map((url) => {
    if (typeof url === 'string' && FILE_API_URL && url.startsWith(FILE_API_URL)) {
      return `${APP_URL}/api/proxy?url=${encodeURIComponent(url)}`
    }
    return url
  })
}

async function deleteFiles(urls: string[]) {
  if (!urls || urls.length === 0) {
    return
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
      } catch (e) {
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

  const res = await fetch(`${FILE_API_URL}/api/${PROJECT_NAME}/upload/files`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ARCON_API_KEY,
    },
    body: JSON.stringify({ files: filesToDelete }),
  })

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

  const res = await fetch(`${FILE_API_URL}/api/${PROJECT_NAME}/upload/folder`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ARCON_API_KEY,
    },
    body: JSON.stringify({ folder: folderPath }),
  })

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

  } catch (error) {
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
    const {
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
      await deleteFolder(`Posts/Images/${id}`)
    } else if (post.images && post.images.length > 0) {
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
