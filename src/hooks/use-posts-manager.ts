'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { PostsApi, PostType, CreatePostRequest, UpdatePostRequest, Post } from '@/lib/posts'

interface TmdbMovie {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  media_type?: string
}

export function usePostsManager(authorId: string) {
  const [posts, setPosts] = useState<Post[]>([])
  const [filterType, setFilterType] = useState<PostType | 'ALL'>('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState<TmdbMovie[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Form state
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<CreatePostRequest>>({
    type: PostType.TEXT,
    title: '',
    content: '',
    imageUrl: '',
    link: '',
  })

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const type = filterType === 'ALL' ? undefined : filterType
      const data = await PostsApi.getAll(type)
      // Filter by authorId on client since API returns all posts
      const myPosts = data.filter((p) => p.authorId === authorId)
      setPosts(myPosts)
    } catch {
      setError('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }, [filterType, authorId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isEditing) {
        await PostsApi.update(isEditing, formData as UpdatePostRequest)
      } else {
        await PostsApi.create({ ...formData, authorId } as CreatePostRequest)
      }
      setFormData({
        type: PostType.TEXT,
        title: '',
        content: '',
        imageUrl: '',
        link: '',
      })
      setTmdbQuery('')
      setTmdbResults([])
      setIsEditing(null)
      fetchPosts()
    } catch (err: unknown) {
      setError((err as Error).message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (post: Post) => {
    setIsEditing(post.id)
    setFormData({
      type: post.type,
      title: post.title || '',
      content: post.content || '',
      imageUrl: post.imageUrl || '',
      link: post.link || '',
    })
    setTmdbQuery('')
    setTmdbResults([])
  }

  const cancelEdit = () => {
    setIsEditing(null)
    setFormData({
      type: PostType.TEXT,
      title: '',
      content: '',
      imageUrl: '',
      link: '',
    })
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (tmdbQuery.length < 3) {
        setTmdbResults([])
        return
      }

      setIsSearching(true)
      try {
        const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
        if (!apiKey) {
          console.error('Please set NEXT_PUBLIC_TMDB_API_KEY in your .env file')
          return
        }
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
            tmdbQuery,
          )}`,
        )
        const data = await res.json()
        setTmdbResults(
          (data.results || []).filter((item: TmdbMovie) => item.media_type === 'movie' || item.media_type === 'tv')
        )
      } catch {
        console.error('Failed to search TMDB')
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [tmdbQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setTmdbResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectMovie = (movie: TmdbMovie) => {
    setFormData({
      ...formData,
      link: movie.title || movie.name,
      imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
    })
    setTmdbResults([])
    setTmdbQuery('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    setLoading(true)
    try {
      await PostsApi.delete(id)
      fetchPosts()
    } catch {
      setError('Failed to delete')
    } finally {
      setLoading(false)
    }
  }

  return {
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
  }
}
