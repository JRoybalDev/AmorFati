import { prisma } from '@/lib/prisma'
import { PostType } from '@/generated/prisma'
import { unstable_cache } from 'next/cache'

const FILE_API_URL = process.env.FILE_API_URL || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || ''

export async function getOrCreateUser(
  email: string,
  username: string | null | undefined,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  clerkId: string
) {
  // Check if user already exists
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (user) {
    return user
  }

  // Prepare data for new user
  const name = [firstName, lastName].filter(Boolean).join(' ')
  const fallbackUsername = `${email.split('@')[0]}-${Math.random().toString(36).slice(2, 7)}`

  return await prisma.user.create({
    data: {
      id: clerkId,
      email,
      username: username || fallbackUsername,
      name: name || username || fallbackUsername,
      accountType: 'User',
    },
  })
}

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

export const getPosts = unstable_cache(
  async (type?: PostType) => {
    const where: { type?: PostType } = {}
    if (type) {
      where.type = type
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, username: true, email: true },
        },
      },
    })

    return posts.map((post) => ({
      ...post,
      images: rewriteImageUrls(post.images),
    }))
  },
  ['all-posts'], // Cache key
  { tags: ['posts'] } // Revalidation tag
)
