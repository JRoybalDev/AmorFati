'use client'

import React from 'react'
import { PostType, Post } from '@/lib/posts'
import { usePostsManager } from '@/hooks/use-posts-manager'

interface PostsManagerProps {
  authorId: string
}

export default function PostsManager({ authorId }: PostsManagerProps) {
  const {
    posts,
    filterType,
    setFilterType,
    loading,
    error,
    tmdbQuery,
    setTmdbQuery,
    tmdbResults,
    isSearching,
    searchContainerRef,
    isEditing,
    formData,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    selectMovie,
    cancelEdit,
  } = usePostsManager(authorId)

  return (
    <div className="p-4 text-black">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Manage Posts</h2>
        <div>
          <label className="mr-2 font-medium">Filter:</label>
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as PostType | 'ALL')
            }
            className="border p-1 rounded"
          >
            <option value="ALL">All</option>
            <option value="TEXT">Text</option>
            <option value="IMAGE">Image</option>
            <option value="FILM">Film</option>
          </select>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded border bg-white p-4 shadow-sm"
      >
        <h3 className="mb-4 text-lg font-bold">
          {isEditing ? 'Edit Post' : 'Create New Post'}
        </h3>
        {error && <div className="mb-2 text-red-500">{error}</div>}

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full rounded border p-2"
              disabled={!!isEditing}
            >
              <option value="TEXT">Text</option>
              <option value="IMAGE">Image</option>
              <option value="FILM">Film</option>
            </select>
          </div>

          {formData.type !== 'IMAGE' && (
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded border p-2"
              />
            </div>
          )}

          {(formData.type === 'TEXT' || formData.type === 'FILM') && (
            <div>
              <label className="block text-sm font-medium">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full rounded border p-2"
                rows={4}
              />
            </div>
          )}

          {(formData.type === 'IMAGE' || formData.type === 'FILM') && (
            <div>
              <label className="block text-sm font-medium">
                {formData.type === 'FILM' ? 'Movie Poster URL' : 'Image URL'}
              </label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full rounded border p-2"
              />
            </div>
          )}

          {formData.type === 'FILM' && (
            <div>
              <div className="mb-4 rounded border bg-gray-50 p-4" ref={searchContainerRef}>
                <label className="block text-sm font-medium mb-2">Search TMDB</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tmdbQuery}
                    onChange={(e) => setTmdbQuery(e.target.value)}
                    placeholder="Search for a movie..."
                    className="w-full rounded border p-2"
                  />
                </div>
                {isSearching && <div className="mt-2 text-sm text-gray-500">Searching...</div>}
                {tmdbResults.length > 0 && (
                  <ul className="mt-2 max-h-60 overflow-y-auto rounded border bg-white">
                    {tmdbResults.map((movie) => (
                      <li
                        key={movie.id}
                        onClick={() => selectMovie(movie)}
                        className="cursor-pointer border-b p-2 hover:bg-gray-100 flex items-center gap-2"
                      >
                        {movie.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title || movie.name}
                            className="h-12 w-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-bold">{movie.title || movie.name}</div>
                          <div className="text-xs text-gray-500">
                            {(movie.release_date || movie.first_air_date)?.split('-')[0]}
                            {movie.media_type === 'tv' ? ' (TV)' : ''}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <label className="block text-sm font-medium">Movie Title</label>
              <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                className="w-full rounded border p-2"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : isEditing
                  ? 'Update Post'
                  : 'Create Post'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded border bg-white p-4 shadow transition hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="w-fit rounded bg-gray-200 px-2 py-1 text-xs font-semibold">
                  {post.type}
                </span>
                <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            {post.title && (
              <h4 className="mb-2 text-lg font-bold">{post.title}</h4>
            )}
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title || 'Post image'}
                className="my-2 h-32 w-full rounded object-cover"
              />
            )}
            {post.content && (
              <p className="line-clamp-2 text-sm text-gray-700">
                {post.content}
              </p>
            )}
            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-sm text-blue-500 underline"
              >
                View Link
              </a>
            )}
          </div>
        ))}
        {posts.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-500">
            No posts found.
          </div>
        )}
      </div>
    </div>
  )
}
