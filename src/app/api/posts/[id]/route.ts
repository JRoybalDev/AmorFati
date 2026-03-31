import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostType } from '@/generated/prisma';

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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      type,
      title,
      content,
      link,
      tags,
      showDetails,
      isPoetry,
      rating,
      year,
      filmTitle,
      createdAt
    } = body;
    let { images } = body;

    // Restore original URLs from proxy URLs
    images = restoreImageUrls(images);

    const post = await prisma.post.update({
      where: { id },
      data: {
        type,
        title,
        content,
        images: images || [],
        link: type === 'TEXT' || type === 'IMAGE' ? null : link,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        tags,
        showDetails,
        isPoetry: isPoetry !== undefined ? !!isPoetry : undefined,
        rating,
        year,
        filmTitle,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.post.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 });
  }
}
