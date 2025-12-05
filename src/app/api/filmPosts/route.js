import prisma from '../../../../lib/prisma'

export async function GET(request) {
  try {
    const posts = await prisma.filmPost.findMany();
    return Response.json(posts);
  } catch (error) {
    console.error(error);
    return new Response('Failted to fetch film posts.', { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validations

    const newPost = await prisma.filmPost.create({
      data: {
        title: body.title,
        content: body.content,
        filmPosterUrl: body.filmPosterUrl,
        filmDbUrl: body.filmDbUrl,
      }
    });

    return Response.json(newPost, { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to create film post.', { status: 400 });
  }
}
