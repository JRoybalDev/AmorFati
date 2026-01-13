import { type Post, PostType } from '@/generated/prisma/client';

export { PostType };
export type { Post };

export interface CreatePostRequest {
  type: PostType;
  title?: string;
  content?: string;
  imageUrl?: string;
  link?: string;
  authorId: string;
  createdAt?: string | Date;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  imageUrl?: string;
  link?: string;
  createdAt?: string | Date;
}

const POSTS_API_URL = '/api/posts';

export const PostsApi = {
  getAll: async (type?: PostType): Promise<Post[]> => {
    const url = type ? `${POSTS_API_URL}?type=${type}` : POSTS_API_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },

  getOne: async (id: string): Promise<Post> => {
    const res = await fetch(`${POSTS_API_URL}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
  },

  create: async (data: CreatePostRequest): Promise<Post> => {
    const res = await fetch(POSTS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create post');
    }

    return res.json();
  },

  update: async (id: string, data: UpdatePostRequest): Promise<Post> => {
    const res = await fetch(`${POSTS_API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update post');
    }

    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${POSTS_API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to delete post');
    }
  },
};
