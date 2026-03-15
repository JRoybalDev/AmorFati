import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostType } from '@/generated/prisma';
import { randomUUID } from 'crypto';

const FILE_API_URL = process.env.FILE_API_URL || ''
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type');
  const authorIdParam = searchParams.get('authorId');

  try {
    const where: Record<string, unknown> = {};
    if (typeParam && Object.values(PostType).includes(typeParam as PostType)) {
      where.type = typeParam as PostType;
    }

    if (authorIdParam) {
      where.authorId = authorIdParam;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, username: true, email: true },
        },
      },
    });

    console.log('[DEBUG] First post images:', posts[0]?.images)
    console.log('[DEBUG] FILE_API_URL:', FILE_API_URL)
    console.log('[DEBUG] APP_URL:', APP_URL)

    const rewritten = posts.map((post) => ({
      ...post,
      images: rewriteImageUrls(post.images),
    }))

    console.log('[DEBUG] First post rewritten images:', rewritten[0]?.images)

    return NextResponse.json(rewritten);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, type, title, content, images, link, authorId, createdAt, tags, showDetails, rating, year, filmTitle } = body;

    // Basic validation based on PostType
    if (!type || !Object.values(PostType).includes(type)) {
      return NextResponse.json({ error: 'Invalid or missing post type' }, { status: 400 });
    }

    if (type === 'IMAGE' && (!images || images.length === 0)) {
      return NextResponse.json({ error: 'Images are required for Image posts' }, { status: 400 });
    }

    if (type === 'TEXT' && (!title || !content)) {
      return NextResponse.json({ error: 'Title and Content are required for Text posts' }, { status: 400 });
    }

    if (type === 'FILM' && (!title || !content || !link || !images || images.length === 0)) {
      return NextResponse.json({ error: 'Post Title, Content, Movie Title, and Poster are required for Film posts' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        id: id || randomUUID(),
        type,
        title,
        content,
        images: images || [],
        link: type === 'TEXT' || type === 'IMAGE' ? undefined : link,
        authorId, // In a real app, you would get this from the authenticated session
        createdAt: createdAt ? new Date(createdAt) : undefined,
        tags,
        showDetails,
        rating,
        year,
        filmTitle,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
  }
}
