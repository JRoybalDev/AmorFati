'use client'

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'
import { PostsApi, PostType, UploadResult } from '@/lib/posts'
import { usePostsManager } from '@/hooks/use-posts-manager'
import { Post } from '../components/Post'
import {
  Bold, Italic, List, Link as LinkIcon, Plus, Edit2, Trash2, Film, LayoutGrid, Search, Image as ImageIcon, Type, X, AlertTriangle, FileText
} from 'lucide-react'
import { Reorder } from 'framer-motion'

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
    setError,
  } = usePosts()

  const [uploading, setUploading] = useState(false)
  const [galleryItems, setGalleryItems] = useState<{ id: string; url: string; file?: File }[]>([])
  const shouldSubmit = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (shouldSubmit.current) {
      shouldSubmit.current = false
      handleSubmit({ preventDefault: () => { } } as React.FormEvent)
    }
  }, [formData.images, formData.id, handleSubmit])

  useEffect(() => {
    if (isEditing) {
      const imgs = formData.images && formData.images.length > 0 ? formData.images : []
      setGalleryItems(imgs.map((url, index) => ({ id: `${url}-${index}`, url })))
    } else {
      setGalleryItems([])
    }
  }, [isEditing])

  useEffect(() => {
    if (!isEditing && (!formData.images || formData.images.length === 0)) {
      setGalleryItems([])
    }
  }, [formData, isEditing])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const files = Array.from(e.target.files)
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} size exceeds 50MB limit.`)
        return
      }
    }

    const newItems = files.map(file => ({
      id: URL.createObjectURL(file),
      url: URL.createObjectURL(file),
      file
    }))

    setGalleryItems(prev => [...prev, ...newItems])

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveItem = (id: string) => {
    setGalleryItems(prev => prev.filter(item => item.id !== id))
  }

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.type === 'IMAGE') {
      if (galleryItems.length === 0) {
        setError('Please add at least one image.')
        return
      }

      setUploading(true)
      try {
        let postId = formData.id
        if (!postId) {
          if (isEditing) {
            postId = isEditing
          } else {
            postId = crypto.randomUUID()
            handleInputChange({ target: { name: 'id', value: postId } } as any)
          }
        }

        const filesToUpload: File[] = galleryItems
          .filter(item => !!item.file)
          .map(item => {
            const sanitizedName = item.file!.name.replace(/[^a-zA-Z0-9.-]/g, '_')
            return new File([item.file!], sanitizedName, { type: item.file!.type })
          });

        let uploadedResults: UploadResult[] = [];
        if (filesToUpload.length > 0) {
          uploadedResults = await PostsApi.upload(filesToUpload, `Posts/Images/${postId}`);
        }

        // Create a map of originalName -> url for robust matching.
        const urlMap = new Map(uploadedResults.map(r => [r.originalName, r.url]));

        // Reconstruct the finalImages array in the correct order.
        const finalImages: string[] = [];
        for (const item of galleryItems) {
          if (item.file) {
            // Sanitize the name just like we did for the upload to find it in the map.
            const sanitizedName = item.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const uploadedUrl = urlMap.get(sanitizedName);

            if (uploadedUrl) {
              finalImages.push(uploadedUrl);
            } else {
              // This can happen if a file upload fails on the server.
              console.error(`Could not find uploaded URL for file: ${sanitizedName}`);
            }
          } else {
            finalImages.push(item.url);
          }
        }

        handleInputChange({ target: { name: 'images', value: finalImages } } as any)
        shouldSubmit.current = true
      } catch (error) {
        console.error('Error uploading image:', error)
        setError('Failed to upload images')
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

            {/* Content Area */}
            {(formData.type === 'TEXT' || formData.type === 'FILM' || formData.type === 'IMAGE') && (
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

            {/* Show Details Checkbox for IMAGE */}
            {formData.type === 'IMAGE' && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="showDetails"
                  name="showDetails"
                  checked={formData.showDetails ?? true}
                  onChange={(e) => handleInputChange({ target: { name: 'showDetails', value: e.target.checked } } as any)}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <label htmlFor="showDetails" className="text-sm text-gray-700 font-medium">Show title and content on post</label>
              </div>
            )}

            {/* Image Upload */}
            {formData.type === 'IMAGE' && (
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Gallery Images</label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <label
                      htmlFor="imageUpload"
                      className={`cursor-pointer rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Add Images
                    </label>
                    <span className="text-sm text-gray-500">Drag to reorder</span>
                  </div>

                  <Reorder.Group axis="y" values={galleryItems} onReorder={setGalleryItems} className="space-y-2">
                    {galleryItems.map((item) => (
                      <Reorder.Item key={item.id} value={item} className="bg-gray-50 rounded-xl p-2 flex items-center gap-3 cursor-move border border-transparent hover:border-gray-200 transition-colors">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.url} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{item.file ? item.file.name : 'Existing Image'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              </div>
            )}

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags || ''}
                onChange={handleInputChange}
                placeholder="Enter tags separated by commas..."
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black/5 outline-none transition-all"
              />
            </div>

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
  const { posts, loading, handleEdit, handleDelete, filterType, setFilterType, currentPage, setCurrentPage, totalPages, viewMode, setViewMode, searchQuery, setSearchQuery } = usePosts()
  const [deletePostId, setDeletePostId] = useState<string | null>(null)

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

  const confirmDelete = async () => {
    if (deletePostId) {
      await handleDelete(deletePostId)
      setDeletePostId(null)
    }
  }

  return (
    <div className="mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Manage Posts</h2>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm transition duration-150 ease-in-out shadow-sm"
              placeholder="Search posts..."
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
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

            {/* View Mode Toggle */}
            <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
              <button
                onClick={() => setViewMode('mosaic')}
                className={`p-2 rounded-full transition-all ${viewMode === 'mosaic' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
                title="Mosaic View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'mosaic' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {posts.map((post) => (
            <div key={post.id} className={`h-full ${post.type === 'TEXT' || post.type === 'FILM' ? 'lg:col-span-2' : ''}`}>
              <Post
                type={post.type || 'TEXT'}
                title={post.title || undefined}
                content={post.content || undefined}
                images={(post as any).images}
                link={post.link || undefined}
                createdAt={post.createdAt}
                rating={(post as any).rating ?? undefined}
                year={(post as any).year ?? undefined}
                filmTitle={(post as any).filmTitle ?? undefined}
                tags={(post as any).tags}
                showDetails={(post as any).showDetails}
              >
                <button
                  onClick={() => handleEdit(post)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeletePostId(post.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </Post>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-900 w-24">Type</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Preview</th>
                  <th className="px-6 py-4 font-semibold text-gray-900 w-24 text-center">Edit</th>
                  <th className="px-6 py-4 font-semibold text-gray-900 w-24 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => {
                  const hasImage = (post as any).images && (post as any).images.length > 0;
                  const displayImage = hasImage ? (post as any).images[0] : null;

                  return (
                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500">
                          {post.type === 'IMAGE' ? <ImageIcon size={18} /> : (post.type === 'FILM' ? <Film size={18} /> : <Type size={18} />)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {hasImage ? (
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={displayImage}
                                alt={post.title || "Post preview"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-gray-300">
                              <Type size={20} />
                            </div>
                          )}
                          <span className="font-medium text-gray-900 line-clamp-1">
                            {post.title || 'Untitled Post'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setDeletePostId(post.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

        {posts.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            No posts found matching your filter.
          </div>
      )}

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

      {/* Delete Confirmation Modal */}
      {deletePostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-red-600 font-bold text-lg">
                <AlertTriangle size={24} />
                <h3>Delete Post</h3>
              </div>
              <button onClick={() => setDeletePostId(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-8">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletePostId(null)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors shadow-sm">
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
