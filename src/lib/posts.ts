import { type Post, PostType } from '@/generated/prisma';

export { PostType };
export type { Post };

export interface CreatePostRequest {
  id?: string;
  type: PostType;
  title?: string;
  content?: string;
  link?: string;
  authorId: string;
  createdAt?: string | Date;
  images?: string[];
  tags?: string;
  showDetails?: boolean;
  rating?: number;
  year?: string;
  filmTitle?: string;
}

export interface UpdatePostRequest {
  type?: PostType;
  title?: string;
  content?: string;
  link?: string;
  createdAt?: string | Date;
  images?: string[];
  tags?: string;
  showDetails?: boolean;
  rating?: number;
  year?: string;
  filmTitle?: string;
}

export interface UploadResult {
  name: string;
  originalName: string;
  success: boolean;
  url: string;
  id: string;
  type: string;
  size: number;
  thumbnail: string;
  isDuplicate: boolean;
}

const POSTS_API_URL = '/api/posts';

/**
 * A centralized error handler for fetch responses.
 * It tries to parse a JSON error message from the response body,
 * falling back to the response text, and finally to a default message.
 * @param response The fetch Response object.
 * @param defaultError The default error message to use as a fallback.
 */
async function handleApiError(response: Response, defaultError: string): Promise<never> {
  let errorMessage = defaultError;
  try {
    const errorBody = await response.json();
    // Check for common error properties from an API response
    errorMessage = errorBody.error || errorBody.message || errorBody.detail || defaultError;
  } catch (jsonError) {
    // If the body isn't JSON, try to use the raw text response.
    try {
      const errorText = await response.text();
      if (errorText) errorMessage = errorText;
    } catch (textError) { /* Ignore and use default */ }
  }
  throw new Error(errorMessage);
}

export const PostsApi = {
  getAll: async (params?: { type?: PostType | 'ALL', authorId?: string }): Promise<Post[]> => {
    const searchParams = new URLSearchParams();
    if (params?.type && params.type !== 'ALL') {
      searchParams.append('type', params.type);
    }
    if (params?.authorId) {
      searchParams.append('authorId', params.authorId);
    }
    const queryString = searchParams.toString();
    const url = queryString ? `${POSTS_API_URL}?${queryString}` : POSTS_API_URL;
    const res = await fetch(url);
    if (!res.ok) await handleApiError(res, 'Failed to fetch posts');
    return res.json();
  },

  getOne: async (id: string): Promise<Post> => {
    const res = await fetch(`${POSTS_API_URL}/${id}`);
    if (!res.ok) await handleApiError(res, 'Failed to fetch post');
    return res.json();
  },

  create: async (data: CreatePostRequest): Promise<Post> => {
    const res = await fetch(POSTS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      await handleApiError(res, 'Failed to create post');
    }

    return res.json();
  },

  update: async (id: string, data: UpdatePostRequest): Promise<Post> => {
    const res = await fetch(`${POSTS_API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      await handleApiError(res, 'Failed to update post');
    }

    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${POSTS_API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      await handleApiError(res, 'Failed to delete post');
    }
  },

  upload: async (files: File[], path?: string): Promise<UploadResult[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));
    if (path) {
      formData.append('path', path);
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      await handleApiError(res, 'Failed to upload files');
    }

    const data = await res.json();
    // The API returns an object like { success: true, results: [...] }
    if (data && data.results && Array.isArray(data.results)) {
      return data.results;
    }

    throw new Error('Unexpected response format from upload API');
  },
};
