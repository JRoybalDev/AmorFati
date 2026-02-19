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
  vote_average?: number
}

export function usePostsManager(authorId: string) {
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [posts, setPosts] = useState<Post[]>([]) // paginated posts
  const [filterType, setFilterType] = useState<PostType | 'ALL'>('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState<TmdbMovie[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [movieTitle, setMovieTitle] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [columnsPerPage] = useState(4)
  const [totalPages, setTotalPages] = useState(0)

  // Form state
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<CreatePostRequest> & { rating?: number; year?: string; filmTitle?: string }>({
    type: PostType.TEXT,
    title: '',
    content: '',
    imageUrl: '',
    link: '',
    rating: undefined,
    year: undefined,
    filmTitle: undefined,
  })

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const type = filterType === 'ALL' ? undefined : filterType
      const data = await PostsApi.getAll(type)
      // Filter by authorId on client since API returns all posts
      const myPosts = data.filter((p) => p.authorId === authorId)
      setAllPosts(myPosts)
    } catch {
      setError('Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }, [filterType, authorId])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Effect for pagination
  useEffect(() => {
    const pages = []
    if (allPosts.length > 0) {
      let currentPageColumns = 0
      let currentPagePosts = []
      for (const post of allPosts) {
        const postWidth = post.type === 'TEXT' || post.type === 'FILM' ? 2 : 1
        if (currentPageColumns + postWidth > columnsPerPage && currentPagePosts.length > 0) {
          pages.push(currentPagePosts)
          currentPagePosts = []
          currentPageColumns = 0
        }
        currentPagePosts.push(post)
        currentPageColumns += postWidth
      }
      if (currentPagePosts.length > 0) {
        pages.push(currentPagePosts)
      }
    }

    setTotalPages(pages.length)
    setPosts(pages[currentPage - 1] || [])
  }, [allPosts, currentPage, columnsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterType])

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
        rating: undefined,
        year: undefined,
        filmTitle: undefined,
      })
      setMovieTitle('')
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
      rating: (post as any).rating ?? undefined,
      year: (post as any).year ?? undefined,
      filmTitle: (post as any).filmTitle ?? undefined,
    })
    setMovieTitle('')
    setTmdbQuery('')
    setTmdbResults([])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setIsEditing(null)
    setFormData({
      type: PostType.TEXT,
      title: '',
      content: '',
      imageUrl: '',
      link: '',
      rating: undefined,
      year: undefined,
      filmTitle: undefined,
    })
    setMovieTitle('')
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
    setMovieTitle(movie.title || movie.name || '')
    const year = (movie.release_date || movie.first_air_date)?.split('-')[0]
    setFormData({
      ...formData,
      link: `https://www.themoviedb.org/${movie.media_type === 'tv' ? 'tv' : 'movie'}/${movie.id}`,
      imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
      rating: movie.vote_average,
      year: year,
      filmTitle: movie.title || movie.name,
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
    posts, // paginated
    totalPosts: allPosts.length,
    filterType,
    setFilterType,
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
    handleEdit,
    handleDelete,
    selectMovie,
    cancelEdit,
    currentPage,
    setCurrentPage,
    totalPages,
  }
}
