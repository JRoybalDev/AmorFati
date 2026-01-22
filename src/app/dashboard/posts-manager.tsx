'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { PostType } from '@/lib/posts'
import { usePostsManager } from '@/hooks/use-posts-manager'
import { Post } from '../components/Post'

// Create a context to share the state
const PostsContext = createContext<ReturnType<typeof usePostsManager> | null>(
  null,
)

export const usePosts = () => {
  const context = useContext(PostsContext)
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider')
  }
  return context
}

interface PostsProviderProps {
  children: React.ReactNode
  authorId: string
}

export function PostsProvider({ children, authorId }: PostsProviderProps) {
  const postsManager = usePostsManager(authorId)

  return (
    <PostsContext.Provider value={postsManager}>
      {children}
    </PostsContext.Provider>
  )
}

export function PostsForm() {
  const {
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
    selectMovie,
    cancelEdit,
  } = usePosts()

  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const shouldSubmit = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (shouldSubmit.current) {
      shouldSubmit.current = false
      handleSubmit({ preventDefault: () => { } } as React.FormEvent)
    }
  }, [formData.imageUrl, handleSubmit])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return

    const file = e.target.files[0]

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit.')
      e.target.value = ''
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    handleInputChange({ target: { name: 'imageUrl', value: url } } as any)
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    handleInputChange({ target: { name: 'imageUrl', value: '' } } as any)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedFile) {
      setUploading(true)
      const data = new FormData()
      data.append('file', selectedFile)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: data,
        })

        if (!response.ok) throw new Error('Upload failed')

        const { url } = await response.json()
        setSelectedFile(null)
        shouldSubmit.current = true
        handleInputChange({ target: { name: 'imageUrl', value: url } } as any)
      } catch (error) {
        console.error('Error uploading image:', error)
      } finally {
        setUploading(false)
      }
    } else {
      handleSubmit(e)
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-(--color-BGnav) font-kingthingsSpikeless">Manage Posts</h2>
      </div>
      <div className='flex w-full gap-4'>
        <form
          onSubmit={onFormSubmit}
          className="mb-8 rounded border border-(--color-BGdivider) bg-BGpage p-4 shadow-sm w-1/2 font-old-standard-tt"
        >
          <h3 className="mb-4 text-lg font-bold text-(--color-BGnav) font-kingthingsSpikeless">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h3>
          {error && <div className="mb-2 text-red-500">{error}</div>}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-TEXTform opacity-70">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full rounded border border-(--color-BGdivider) p-2 bg-white text-TEXTform"
                disabled={!!isEditing}
              >
                <option value="TEXT">Text</option>
                <option value="IMAGE">Image</option>
                <option value="FILM">Film</option>
              </select>
            </div>

            {formData.type !== 'IMAGE' && (
              <div>
                <label className="block text-sm font-medium text-TEXTform opacity-70">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded border border-(--color-BGdivider) p-2 bg-white text-TEXTform placeholder:text-TEXTform placeholder:opacity-50"
                />
              </div>
            )}

            {(formData.type === 'TEXT' || formData.type === 'FILM') && (
              <div>
                <label className="block text-sm font-medium text-TEXTform opacity-70">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full rounded border border-(--color-BGdivider) p-2 bg-white text-TEXTform placeholder:text-TEXTform placeholder:opacity-50"
                  rows={4}
                />
              </div>
            )}

            {formData.type === 'FILM' && (
              <div>
                <div
                  className="mb-4 rounded border border-(--color-BGdivider) bg-white/50 p-4"
                  ref={searchContainerRef}
                >
                  <label className="mb-2 block text-sm font-medium text-TEXTform opacity-70">
                    Search TMDB
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tmdbQuery}
                      onChange={(e) => setTmdbQuery(e.target.value)}
                      placeholder="Search for a movie..."
                      className="w-full rounded border border-(--color-BGdivider) p-2 bg-white text-TEXTform placeholder:text-TEXTform placeholder:opacity-50"
                    />
                  </div>
                  {isSearching && (
                    <div className="mt-2 text-sm text-gray-500">Searching...</div>
                  )}
                  {tmdbResults.length > 0 && (
                    <ul className="mt-2 max-h-60 overflow-y-auto rounded border bg-white text-TEXTform">
                      {tmdbResults.map((movie) => (
                        <li
                          key={movie.id}
                          onClick={() => selectMovie(movie)}
                          className="flex cursor-pointer items-center gap-2 border-b border-(--color-BGdivider) p-2 hover:bg-BGpage"
                        >
                          {movie.poster_path && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                              alt={movie.title || movie.name}
                              className="h-12 w-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-bold">
                              {movie.title || movie.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(movie.release_date || movie.first_air_date)?.split(
                                '-',
                              )[0]}
                              {movie.media_type === 'tv' ? ' (TV)' : ''}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-TEXTform opacity-70">Movie Title</label>
                  <input
                    type="text"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder={`${formData.type === 'FILM' && "Autofilled from 'Search TMDB' field..."}`}
                    className="w-full rounded border border-(--color-BGdivider) bg-gray-100 p-2 text-TEXTform placeholder:text-TEXTform placeholder:opacity-50"
                  />
                </div>
              </div>
            )}

            {(formData.type === 'IMAGE' || formData.type === 'FILM') && (
              <div>
                <label className="block text-sm font-medium text-TEXTform opacity-70">
                  {formData.type === 'FILM' ? 'Movie Poster URL' : 'Image URL'}
                </label>
                {formData.type === 'IMAGE' ? (
                  <div className="flex flex-col gap-2">
                    {!isEditing && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading || (!!formData.imageUrl && !selectedFile)}
                          className="hidden"
                          ref={fileInputRef}
                        />
                        <label
                          htmlFor="imageUpload"
                          className={`cursor-pointer rounded bg-(--color-BGbutton) px-4 py-2 text-TEXTmain hover:bg-(--color-HOVERbutton) font-kingthingsSpikeless whitespace-nowrap ${(uploading || (!!formData.imageUrl && !selectedFile)) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          Choose Image
                        </label>
                        {(selectedFile || formData.imageUrl) && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600 font-kingthingsSpikeless"
                          >
                            Remove Image
                          </button>
                        )}
                        {selectedFile && <span className="min-w-0 truncate text-sm text-gray-600">{selectedFile.name}</span>}
                      </div>
                    )}
                    {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                    {!selectedFile && (
                      <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="Or paste image URL..."
                        className="w-full rounded border border-(--color-BGdivider) p-2 bg-white text-TEXTform placeholder:text-TEXTform placeholder:opacity-50"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder={`${formData.type === 'FILM' && "Autofilled from 'Search TMDB' field..."}`}
                    className={`w-full rounded border border-(--color-BGdivider) p-2 ${formData.type === 'FILM' && 'bg-gray-100'} text-TEXTform placeholder:text-TEXTform placeholder:opacity-50`}
                  />
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-(--color-BGbutton) px-4 py-2 text-TEXTmain hover:bg-(--color-HOVERbutton) disabled:opacity-50 font-kingthingsSpikeless"
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
                  className="rounded bg-(--color-BGdivider) px-4 py-2 text-TEXTmain hover:bg-(--color-BGnav) font-kingthingsSpikeless"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
        <PostPreview />
      </div>
    </>
  )
}

export function PostPreview() {
  const { formData } = usePosts()

  return (
    <div className="w-1/2 font-old-standard-tt">
      <h3 className="mb-4 text-lg font-bold text-(--color-BGnav) font-kingthingsSpikeless">Preview</h3>
      <Post
        type={formData.type || 'TEXT'}
        title={formData.title}
        content={formData.content}
        imageUrl={formData.imageUrl}
        link={formData.link}
        createdAt={new Date()}
      />
    </div>
  )
}

export function PostsList() {
  const { posts, loading, handleEdit, handleDelete, filterType, setFilterType } = usePosts()

  return (
    <>
      <div className='flex justify-between'>
        <h2 className="mb-6 text-3xl text-(--color-BGnav) font-kingthingsSpikeless">
          Your Posts
        </h2>
        <div className="mb-4">
          <label className="mr-2 font-medium font-old-standard-tt text-TEXTform opacity-70">
            Filter:
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as PostType | 'ALL')}
            className="rounded border border-(--color-BGdivider) p-1 font-old-standard-tt bg-white text-TEXTform"
          >
            <option value="ALL">All</option>
            <option value="TEXT">Text</option>
            <option value="IMAGE">Image</option>
            <option value="FILM">Film</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 font-old-standard-tt">
        {posts.map((post) => (
          <Post
            key={post.id}
            type={post.type || 'TEXT'}
            title={post.title || undefined}
            content={post.content || undefined}
            imageUrl={post.imageUrl || undefined}
            link={post.link || undefined}
            createdAt={post.createdAt}
          >
            <button
              onClick={() => handleEdit(post)}
              className="text-sm text-(--color-BGnav) hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(post.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </Post>
        ))}
        {posts.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-500">
            No posts found.
          </div>
        )}
      </div>
    </>
  )
}
