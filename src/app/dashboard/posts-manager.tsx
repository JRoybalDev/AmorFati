'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { PostsApi, PostType } from '@/lib/posts'
import { usePostsManager } from '@/hooks/use-posts-manager'
import { Post } from '../components/Post'
import {
  Bold, Italic, List, Link as LinkIcon, Plus, Edit2, Trash2, Film
} from 'lucide-react'

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
    movieTitle,
    isEditing,
    formData,
    handleInputChange,
    handleSubmit,
    selectMovie,
    cancelEdit,
  } = usePosts()

  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const shouldSubmit = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (shouldSubmit.current) {
      shouldSubmit.current = false
      handleSubmit({ preventDefault: () => { } } as React.FormEvent)
    }
  }, [formData.imageUrl, handleSubmit])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const files = Array.from(e.target.files)

    if (files.length > 5) {
      alert('You can only upload up to 5 images.')
      return
    }

    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} size exceeds 50MB limit.`)
        return
      }
    }

    setSelectedFiles(files)
    const url = URL.createObjectURL(files[0])
    handleInputChange({ target: { name: 'imageUrl', value: url } } as any)
  }

  const handleRemoveImage = () => {
    setSelectedFiles([])
    handleInputChange({ target: { name: 'imageUrl', value: '' } } as any)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedFiles.length > 0) {
      setUploading(true)
      try {
        const url = await PostsApi.upload(selectedFiles)
        setSelectedFiles([])
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
    <div className="space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Studio</h1>
          <p className="text-gray-500 mt-1">Create, manage and schedule your content across platforms.</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm mb-1">
          <Plus size={18} />
          <span>New Post</span>
        </button>
      </div>

      <div className="grid grid-cols-1">
        {/* Create Post Section - Full Width */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Post' : 'Create New Post'}
            </h2>
            <div className="flex bg-gray-50 p-1 rounded-xl">
              {['TEXT', 'IMAGE', 'FILM'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'type', value: t } } as any)}
                  className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${formData.type === t
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

          <form onSubmit={onFormSubmit} className="space-y-6">
            {/* Title Input */}
            {formData.type !== 'IMAGE' && (
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter post title..."
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black/5 outline-none transition-all"
                />
              </div>
            )}

            {/* Content Area */}
            {(formData.type === 'TEXT' || formData.type === 'FILM') && (
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Content</label>
                <div className="relative group">
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your thoughts here..."
                    rows={8}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black/5 outline-none resize-none pb-14 transition-all"
                  />
                  {/* Visual Toolbar */}
                  <div className="absolute bottom-3 left-4 flex gap-4 text-gray-400">
                    <button type="button" className="hover:text-gray-600 transition-colors"><Bold size={18} /></button>
                    <button type="button" className="hover:text-gray-600 transition-colors"><Italic size={18} /></button>
                    <button type="button" className="hover:text-gray-600 transition-colors"><List size={18} /></button>
                    <button type="button" className="hover:text-gray-600 transition-colors"><LinkIcon size={18} /></button>
                  </div>
                </div>
              </div>
            )}

            {/* Film Search */}
            {formData.type === 'FILM' && (
              <div className="space-y-4 pt-2">
                <div className="relative" ref={searchContainerRef}>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Search Movie</label>
                  <input
                    type="text"
                    value={tmdbQuery}
                    onChange={(e) => setTmdbQuery(e.target.value)}
                    placeholder="Search TMDB..."
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black/5 outline-none"
                  />
                  {tmdbResults.length > 0 && (
                    <ul className="absolute z-10 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
                      {tmdbResults.map((movie) => (
                        <li
                          key={movie.id}
                          onClick={() => selectMovie(movie)}
                          className="flex cursor-pointer items-center gap-3 border-b border-gray-50 p-3 hover:bg-gray-50 transition-colors"
                        >
                          {movie.poster_path && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                              alt={movie.title || movie.name}
                              className="h-10 w-7 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-bold text-sm text-gray-900">{movie.title || movie.name}</div>
                            <div className="text-xs text-gray-500">
                              {(movie.release_date || movie.first_air_date)?.split('-')[0]}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {movieTitle && (
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium flex items-center gap-2">
                    <Film size={16} />
                    Selected: {movieTitle}
                  </div>
                )}
              </div>
            )}

            {/* Image Upload */}
            {formData.type === 'IMAGE' && (
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Upload Image</label>
                <div className="flex flex-col gap-4">
                  {!isEditing && (
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={uploading || (!!formData.imageUrl && selectedFiles.length === 0)}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <label
                        htmlFor="imageUpload"
                        className={`cursor-pointer rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors ${(uploading || (!!formData.imageUrl && selectedFiles.length === 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Choose File
                      </label>
                      {selectedFiles.length > 0 && <span className="text-sm text-gray-600">{selectedFiles.length} file(s) selected</span>}
                      {(selectedFiles.length > 0 || formData.imageUrl) && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}

                  {selectedFiles.length === 0 && (
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="Or paste image URL..."
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black/5 outline-none"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              )}
              {!isEditing && (
                <button
                  type="button"
                  className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Save Draft
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 text-sm font-bold bg-[#d4f34a] text-black rounded-full hover:bg-[#cce944] transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {loading ? 'Processing...' : (isEditing ? 'Update Post' : 'Publish Now')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export function PostsList() {
  const { posts, loading, handleEdit, handleDelete, filterType, setFilterType, currentPage, setCurrentPage, totalPages } = usePosts()

  const getPaginationItems = (currentPage: number, totalPages: number) => {
    const delta = 1
    const range: (string | number)[] = []
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) range.unshift('...')
    if (currentPage + delta < totalPages - 1) range.push('...')

    range.unshift(1)
    if (totalPages > 1) range.push(totalPages)

    return [...new Set(range)]
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Manage Posts</h2>

        {/* Filter Tabs */}
        <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
          {['ALL', 'TEXT', 'IMAGE', 'FILM'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${filterType === type
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {type === 'ALL' ? 'All Posts' : (type === 'IMAGE' ? 'Photos' : (type === 'FILM' ? 'Films' : 'Text'))}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {posts.map((post) => (
          <div key={post.id} className={`h-full ${post.type === 'TEXT' || post.type === 'FILM' ? 'lg:col-span-2' : ''}`}>
            <Post
              type={post.type || 'TEXT'}
              title={post.title || undefined}
              content={post.content || undefined}
              imageUrl={post.imageUrl || undefined}
              images={(post as any).images}
              link={post.link || undefined}
              createdAt={post.createdAt}
              rating={(post as any).rating ?? undefined}
              year={(post as any).year ?? undefined}
              filmTitle={(post as any).filmTitle ?? undefined}
            >
              <button
                onClick={() => handleEdit(post)}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </Post>
          </div>
        ))}
        {posts.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            No posts found matching your filter.
          </div>
        )}
      </div>

      {/* Visual Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt;
          </button>
          {getPaginationItems(currentPage, totalPages).map((item, index) => {
            if (item === '...') {
              return <span key={`${item}-${index}`} className="flex items-end px-2 text-gray-300 pb-2">...</span>
            }
            return (
              <button
                key={item}
                onClick={() => setCurrentPage(item as number)}
                className={`w-10 h-10 flex items-center justify-center rounded-full border transition-colors ${currentPage === item
                  ? 'bg-gray-900 text-white font-bold shadow-md border-gray-900'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {item}
              </button>
            )
          })}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  )
}
