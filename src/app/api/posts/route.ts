import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostType } from '@/generated/prisma/enums';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    const posts = await prisma.post.findMany({
      where: type ? { type: type as PostType } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, username: true, email: true },
        },
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Error fetching posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, content, imageUrl, link, authorId } = body;

    // Basic validation based on PostType
    if (!type || !Object.values(PostType).includes(type)) {
      return NextResponse.json({ error: 'Invalid or missing post type' }, { status: 400 });
    }

    if (type === 'IMAGE' && !imageUrl) {
      return NextResponse.json({ error: 'Image URL is required for Image posts' }, { status: 400 });
    }

    if (type === 'FILM' && (!title || !link)) {
      return NextResponse.json({ error: 'Title and Link are required for Film posts' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        type,
        title,
        content,
        imageUrl,
        link,
        authorId, // In a real app, you would get this from the authenticated session
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Error creating post' }, { status: 500 });
  }
}
