'use client'

import React, { createContext, useContext, useState, useRef, useEffect, useOptimistic } from 'react'
import { PostsApi, PostType, UploadResult } from '@/lib/posts'
import { usePostsManager, DashboardFilterType } from '@/hooks/use-posts-manager'
import { Post } from '../components/Post'
import {
  List, Plus, Edit2, Trash2, Film, LayoutGrid, Search, Image as ImageIcon, Type, X, AlertTriangle, Feather, Filter
} from 'lucide-react'
import { revalidatePosts } from '@/app/actions/posts'
import { Reorder, AnimatePresence, motion } from 'framer-motion'
import { FadeLoader } from 'react-spinners'
import RichTextEditor from '../components/RichTextEditor'

// Create a context to share the state
type GalleryItem = { id: string; url: string; file?: File }

interface DashboardPost {
  id: string
  type: PostType
  title: string | null
  content: string | null
  images: string[]
  isPoetry: boolean | null
  showDetails: boolean | null
  createdAt: Date
  updatedAt: Date
  authorId: string
  filmTitle: string | null
  link: string | null
  rating: number | null
  year: string | null
  tags: string | null
}

type OptimisticAction =
  | { type: 'DELETE'; payload: string }
  | { type: 'CREATE'; payload: DashboardPost }
  | { type: 'UPDATE'; payload: DashboardPost }

type PostsContextType = ReturnType<typeof usePostsManager> & {
  galleryItems: GalleryItem[]
  setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>
  isFormVisible: boolean
  setIsFormVisible: React.Dispatch<React.SetStateAction<boolean>>
  optimisticPosts: DashboardPost[]
  addOptimisticPost: (action: OptimisticAction) => void
  authorId: string
}

const PostsContext = createContext<PostsContextType | null>(
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
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [isFormVisible, setIsFormVisible] = useState(false)
  const { isEditing, formData, posts } = postsManager

  // Initialize optimistic state based on the posts from usePostsManager
  const [optimisticPosts, addOptimisticPost] = useOptimistic<DashboardPost[], OptimisticAction>(
    posts as DashboardPost[],
    (state, action) => {
      switch (action.type) {
        case 'DELETE':
          return state.filter((p: DashboardPost) => p.id !== action.payload)
        case 'CREATE':
          return [action.payload, ...state]
        case 'UPDATE':
          return state.map((p: DashboardPost) => p.id === action.payload.id ? { ...p, ...action.payload } : p)
        default:
          return state
      }
    }
  )

  useEffect(() => {
    if (isEditing) {
      const imgs = formData.images && formData.images.length > 0 ? formData.images : []
      setGalleryItems(imgs.map((url: string, index: number) => ({ id: `${url}-${index}`, url })))
      setIsFormVisible(true)
    }
  }, [isEditing])

  // Clear gallery items only when the form is explicitly closed.
  // This prevents images from being cleared when typing in Title/Content fields.
  useEffect(() => {
    if (!isFormVisible) {
      setGalleryItems([])
    }
  }, [isFormVisible])

  // Scroll to the workspace when starting to edit a post
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        const workspace = document.getElementById('posts-workspace')
        if (workspace) {
          workspace.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 100)
    }
  }, [isEditing])

  const value = {
    ...postsManager,
    galleryItems,
    setGalleryItems,
    isFormVisible,
    setIsFormVisible,
    optimisticPosts,
    addOptimisticPost,
    authorId,
  }

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  )
}

export function PostsHeader() {
  const { setIsFormVisible, isFormVisible, cancelEdit } = usePosts()

  const handleNewPost = () => {
    cancelEdit()
    const nextVisible = !isFormVisible
    setIsFormVisible(nextVisible)
    if (nextVisible) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Studio</h1>
        <p className="text-gray-500 mt-1">Create, manage and schedule your content across platforms.</p>
      </div>
      <button
        onClick={handleNewPost}
        className="flex items-center gap-2 bg-BGbutton text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-HOVERbutton transition-colors shadow-sm mb-1 mt-4 md:mt-0 w-fit"
      >
        <Plus size={18} />
        <span className='mb-1'>New Post</span>
      </button>
    </div>
  )
}

export function PostsWorkspace() {
  const { isFormVisible } = usePosts()

  return (
    <AnimatePresence>
      {isFormVisible && (
        <motion.div
          id="posts-workspace"
          initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
          animate={{ opacity: 1, height: 'auto', transitionEnd: { overflow: 'visible' } }}
          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            <PostsForm />
            <PostPreview />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function PostsForm() {
  const {
    loading,
    error,
    tmdbQuery,
    setTmdbQuery,
    tmdbResults,
    searchContainerRef,
    movieTitle,
    isEditing,
    formData,
    handleInputChange,
    handleSubmit,
    selectMovie,
    cancelEdit,
    setError,
    galleryItems,
    setGalleryItems,
    setIsFormVisible,
    addOptimisticPost,
    authorId,
  } = usePosts()

  const [uploading, setUploading] = useState(false)
  const shouldSubmit = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (shouldSubmit.current) {
      shouldSubmit.current = false
      handleSubmit({ preventDefault: () => { } } as React.FormEvent).then(async (success: boolean) => {
        if (success) {
          if (formData.id) {
            addOptimisticPost({
              type: 'UPDATE',
              payload: {
                ...formData,
                title: formData.title ?? null,
                content: formData.content ?? null,
                isPoetry: formData.isPoetry ?? null,
                showDetails: formData.showDetails ?? null,
                filmTitle: formData.filmTitle ?? null,
                link: formData.link ?? null,
                rating: formData.rating ?? null,
                year: formData.year ? String(formData.year) : null,
                tags: formData.tags ?? null,
                createdAt: new Date(formData.createdAt ?? new Date()),
                updatedAt: new Date(),
                authorId
              } as DashboardPost
            })
          } else {
            addOptimisticPost({
              type: 'CREATE',
              payload: {
                ...formData,
                title: formData.title ?? null,
                content: formData.content ?? null,
                isPoetry: formData.isPoetry ?? null,
                showDetails: formData.showDetails ?? null,
                filmTitle: formData.filmTitle ?? null,
                link: formData.link ?? null,
                rating: formData.rating ?? null,
                year: formData.year ? String(formData.year) : null,
                tags: formData.tags ?? null,
                id: 'temp-' + Date.now(),
                createdAt: new Date(),
                updatedAt: new Date(),
                authorId
              } as DashboardPost
            })
          }
          await revalidatePosts()
          setIsFormVisible(false)
        }
      })
    }
  }, [formData.images, formData.id, handleSubmit, setIsFormVisible])

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

  const handleCancel = () => {
    cancelEdit()
    setIsFormVisible(false)
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
            postId = typeof isEditing === 'string' ? isEditing : crypto.randomUUID()
          } else {
            postId = crypto.randomUUID()
            handleInputChange({ target: { name: 'id', value: postId } } as unknown as React.ChangeEvent<HTMLInputElement>)
          }
        }

        // Determine upload path
        let uploadPath = `Posts/Images/${postId}`

        // Try to detect existing folder from existing images to keep them together
        const existingItem = galleryItems.find((item) => !item.file && item.url)
        if (existingItem) {
          try {
            let url = existingItem.url
            if (url.includes('/api/proxy?url=')) {
              const urlObj = new URL(url, window.location.origin)
              const original = urlObj.searchParams.get('url')
              if (original) url = original
            }

            const lastSlashIndex = url.lastIndexOf('/')
            if (lastSlashIndex !== -1) {
              const parentDir = url.substring(0, lastSlashIndex)
              const postsIndex = parentDir.indexOf('Posts/Images')
              if (postsIndex !== -1) {
                uploadPath = parentDir.substring(postsIndex)
              }
            }
          } catch (e) {
            console.warn('Could not determine existing folder path', e)
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
          uploadedResults = await PostsApi.upload(filesToUpload, uploadPath);
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

        handleInputChange({ target: { name: 'images', value: finalImages } })
        shouldSubmit.current = true
      } catch (error) {
        console.error('Error uploading image:', error)
        setError('Failed to upload images')
      } finally {
        setUploading(false)
      }
    } else {
      const success = await handleSubmit(e)
      if (success) {
        if (formData.id) {
          addOptimisticPost({
            type: 'UPDATE',
            payload: {
              ...formData,
              title: formData.title ?? null,
              content: formData.content ?? null,
              isPoetry: formData.isPoetry ?? null,
              showDetails: formData.showDetails ?? null,
              filmTitle: formData.filmTitle ?? null,
              link: formData.link ?? null,
              rating: formData.rating ?? null,
              year: formData.year ? String(formData.year) : null,
              tags: formData.tags ?? null,
              createdAt: new Date(formData.createdAt ?? new Date()),
              updatedAt: new Date(),
              authorId
            } as DashboardPost
          })
        } else {
          addOptimisticPost({
            type: 'CREATE',
            payload: {
              ...formData,
              title: formData.title ?? null,
              content: formData.content ?? null,
              isPoetry: formData.isPoetry ?? null,
              showDetails: formData.showDetails ?? null,
              filmTitle: formData.filmTitle ?? null,
              link: formData.link ?? null,
              rating: formData.rating ?? null,
              year: formData.year ? String(formData.year) : null,
              tags: formData.tags ?? null,
              id: 'temp-' + Date.now(),
              createdAt: new Date(),
              updatedAt: new Date(),
              authorId
            } as DashboardPost
          })
        }
        await revalidatePosts()
        setIsFormVisible(false)
      }
    }
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
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
                  onClick={() => handleInputChange({ target: { name: 'type', value: t as PostType } })}
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
                <RichTextEditor
                  value={formData.content}
                  onChange={(html) =>
                    handleInputChange({
                      target: { name: 'content', value: html },
                    } as unknown as React.ChangeEvent<HTMLTextAreaElement>)
                  }
                />
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

            {/* isPoetry Checkbox for TEXT */}
            {formData.type === 'TEXT' && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPoetry"
                  name="isPoetry"
                  checked={formData.isPoetry ?? false}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <label htmlFor="isPoetry" className="text-sm text-gray-700 font-medium">Mark as Poetry</label>
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
                  onChange={handleInputChange}
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
                      className={`cursor-pointer rounded-xl bg-BGbutton px-5 py-3 text-sm font-medium text-white hover:bg-BGbuttonSelected transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 text-sm font-bold bg-BGbutton text-white rounded-full hover:bg-BGbuttonSelected transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
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

export function PostPreview() {
  const { formData, movieTitle, galleryItems } = usePosts()

  const previewImages = formData.type === 'IMAGE'
    ? galleryItems.map((item) => item.url)
    : formData.images || []

  const hasContent =
    !!formData.title?.trim() ||
    !!formData.content?.trim() && formData.content.trim() !== '<p></p>' ||
    previewImages.length > 0 ||
    !!movieTitle

  if (!hasContent) return null

  return (
    <>
      <div className="rounded-3xl p-8 h-full sticky top-8 font-sans">
        <div className="flex justify-center">
          <Post
            type={formData.type || 'TEXT'}
            title={formData.title}
            content={formData.content}
            images={previewImages}
            link={formData.link}
            createdAt={new Date()}
            rating={formData.rating}
            year={formData.year}
            filmTitle={movieTitle || formData.filmTitle}
            tags={formData.tags}
            isPoetry={formData.isPoetry}
            showDetails={formData.showDetails}
          />
        </div>
      </div>
    </>
  )
}

export function PostsList() {
  const { optimisticPosts, loading, handleEdit, handleDelete, filterType, setFilterType, currentPage, setCurrentPage, totalPages, viewMode, setViewMode, searchQuery, setSearchQuery, addOptimisticPost } = usePosts()
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
      addOptimisticPost({ type: 'DELETE', payload: deletePostId })
      await handleDelete(deletePostId)
      await revalidatePosts()
      setDeletePostId(null)
    }
  }

  return (
    <div className="mt-12">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Manage Posts</h2>

        <div className="flex items-center gap-2 md:gap-4 w-full xl:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64 md:flex-none">
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

          <div className="flex items-center gap-2 md:gap-4 xl:w-auto justify-end">
            {/* Mobile Filter Dropdown */}
            <div className="relative md:hidden" ref={filterRef}>
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full text-gray-500 shadow-sm"
                title="Filter Posts"
              >
                <Filter size={18} className={filterType !== 'ALL' ? 'text-BGbutton' : ''} />
              </button>

              <AnimatePresence>
                {isFilterDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 overflow-hidden"
                  >
                    {['ALL', 'IMAGE', 'TEXT', 'POETRY', 'FILM'].map((type) => (
                      <button
                        key={type}
                        onClick={() => { setFilterType(type as DashboardFilterType); setIsFilterDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${filterType === type
                          ? 'bg-gray-50 text-BGbutton'
                          : 'text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {type === 'ALL' ? 'All' : (type === 'IMAGE' ? 'Gallery' : (type === 'FILM' ? 'Films' : (type === 'POETRY' ? 'Poetry' : 'Text')))}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Tabs */}
            <div className="hidden md:flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
              {['ALL', 'IMAGE', 'TEXT', 'POETRY', 'FILM'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as DashboardFilterType)}
                  className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${filterType === type
                    ? 'bg-BGbutton text-white shadow-md'
                    : 'text-gray-500 hover:text-BGbuttonSelected hover:bg-gray-50'
                    }`}
                >
                  {type === 'ALL' ? 'All' : (type === 'IMAGE' ? 'Gallery' : (type === 'FILM' ? 'Films' : (type === 'POETRY' ? 'Poetry' : 'Text')))}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
              <button
                onClick={() => setViewMode('mosaic')}
                className={`p-2 rounded-full transition-all ${viewMode === 'mosaic' ? 'bg-BGbutton text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
                title="Mosaic View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-BGbutton text-white shadow-md' : 'text-gray-400 hover:text-gray-900'}`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 w-full bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in duration-500">
          <FadeLoader color="#BE5103" />
          <p className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Updating Dashboard...</p>
        </div>
      ) : viewMode === 'mosaic' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {optimisticPosts.map((post) => (
            <div key={post.id} className={`h-full ${post.type === 'TEXT' || post.type === 'FILM' ? 'lg:col-span-2' : ''}`}>
              <Post
                type={post.type || 'TEXT'}
                title={post.title || undefined}
                content={post.content || undefined}
                images={post.images}
                link={post.link || undefined}
                createdAt={post.createdAt}
                rating={post.rating ?? undefined}
                year={post.year ?? undefined}
                filmTitle={post.filmTitle ?? undefined}
                tags={post.tags || undefined}
                isPoetry={post.isPoetry ?? false}
                showDetails={post.showDetails ?? undefined}
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
                    {optimisticPosts.map((post) => {
                  const hasImage = post.images && post.images.length > 0;
                  const displayImage = hasImage ? post.images[0] : null;

                  return (
                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500">
                          {post.type === 'IMAGE' ? (
                            <ImageIcon size={18} />
                          ) : post.type === 'FILM' ? (
                            <Film size={18} />
                          ) : post.isPoetry ? (
                            <Feather size={18} />
                          ) : (
                            <Type size={18} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {hasImage ? (
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={displayImage ?? undefined}
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

      {optimisticPosts.length === 0 && !loading && (
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
