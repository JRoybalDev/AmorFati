import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import cloudinary from '@/lib/cloudinary';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      createdAt,
      images,
    } = body;

    // Get the existing post to compare images
    const existingPost = await prisma.post.findUnique({ where: { id } });

    // Find images that were removed (in old list but not in new list)
    const existingImages: string[] = existingPost?.images ?? [];
    const newImages: string[] = images ?? [];
    const removedImages = existingImages.filter(url => !newImages.includes(url));

    // Delete removed images from Cloudinary
    if (removedImages.length > 0) {
      const deletePromises = removedImages.map(url => {
        const parts = url.split('/');
        const fileName = parts[parts.length - 1].split('.')[0];
        const folder = parts.slice(parts.indexOf('upload') + 2, -1).join('/');
        const publicId = folder ? `${folder}/${fileName}` : fileName;
        return cloudinary.uploader.destroy(publicId);
      });
      await Promise.all(deletePromises);
      console.log(`Deleted ${removedImages.length} image(s) from Cloudinary.`);
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        type,
        title,
        content,
        images: newImages,
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

    revalidateTag('posts');

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Error updating post' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the post first to get image URLs for deletion from Cloudinary
    const post = await prisma.post.findUnique({ where: { id } });
    if (post?.images && Array.isArray(post.images)) {
      const deletePromises = post.images.map(url => {
        // Simple regex to extract public_id from Cloudinary URL
        // e.g. https://res.cloudinary.com/demo/image/upload/v1234/folder/image.jpg -> folder/image
        const parts = url.split('/');
        const fileName = parts[parts.length - 1].split('.')[0];
        const folder = parts.slice(parts.indexOf('upload') + 2, -1).join('/');
        const publicId = folder ? `${folder}/${fileName}` : fileName;
        return cloudinary.uploader.destroy(publicId);
      });
      await Promise.all(deletePromises);
    }

    await prisma.post.delete({
      where: { id },
    });

    revalidateTag('posts');

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Error deleting post' }, { status: 500 });
  }
}
