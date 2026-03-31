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

export type DashboardFilterType = PostType | 'POETRY' | 'ALL'

export function usePostsManager(authorId: string) {
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [posts, setPosts] = useState<Post[]>([]) // paginated posts
  const [filterType, setFilterType] = useState<DashboardFilterType>('ALL')
  const [viewMode, setViewMode] = useState<'mosaic' | 'list'>('list')
  const [searchQuery, setSearchQuery] = useState('')
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
  const [formData, setFormData] = useState<Partial<CreatePostRequest>>({
    type: PostType.TEXT,
    title: '',
    content: '',
    images: [],
    link: '',
    rating: undefined,
    year: undefined,
    filmTitle: undefined,
    tags: '',
    showDetails: true,
    isPoetry: false,
  })

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const apiType = filterType === 'POETRY' ? PostType.TEXT : filterType
      const data = await PostsApi.getAll({ type: apiType as any, authorId })
      setAllPosts(data)
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

    let filteredPosts = allPosts.filter(post => {
      if (filterType === 'POETRY') return post.isPoetry === true
      if (filterType === 'TEXT') return !post.isPoetry
      return true
    })

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      filteredPosts = allPosts.filter(post =>
        (post.title?.toLowerCase() || '').includes(lowerQuery) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((post as any).tags?.toLowerCase() || '').includes(lowerQuery)
      )
    }

    if (filteredPosts.length > 0) {
      let currentPageColumns = 0
      let currentPagePosts = []

      if (viewMode === 'list') {
        const itemsPerPage = 10
        for (let i = 0; i < filteredPosts.length; i += itemsPerPage) {
          pages.push(filteredPosts.slice(i, i + itemsPerPage))
        }
      } else {
        for (const post of filteredPosts) {
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
    }

    setTotalPages(pages.length)
    setPosts(pages[currentPage - 1] || [])
  }, [allPosts, currentPage, columnsPerPage, viewMode, searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchQuery])

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      > | { target: { name: string; value: any; type?: string } },
  ) => {
    const target = e.target
    const { name, value } = target

    // Correctly detect checkbox status even with forwarded/custom events
    const isCheckbox = 'type' in target && target.type === 'checkbox'
    const finalValue = isCheckbox ? (target as HTMLInputElement).checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }))
  }

  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isEditing) {
        await PostsApi.update(isEditing, formData as UpdatePostRequest)
      } else {
        const postData = { ...formData, authorId } as CreatePostRequest
        if (!postData.id) {
          postData.id = crypto.randomUUID()
        }
        await PostsApi.create(postData)
      }
      setFormData({
        type: PostType.TEXT,
        title: '',
        content: '',
        images: [],
        link: '',
        rating: undefined,
        year: undefined,
        filmTitle: undefined,
        tags: '',
        showDetails: true,
        isPoetry: false,
      })
      setMovieTitle('')
      setTmdbQuery('')
      setTmdbResults([])
      setIsEditing(null)
      fetchPosts()
      return true
    } catch (err: unknown) {
      setError((err as Error).message || 'Operation failed')
      return false
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
      images: post.images || [],
      link: post.link || '',
      rating: post.rating ?? undefined,
      year: post.year ?? undefined,
      filmTitle: post.filmTitle ?? undefined,
      tags: post.tags || '',
      showDetails: post.showDetails ?? true,
      isPoetry: post.isPoetry ?? false,
    })
    setMovieTitle('')
    setTmdbQuery('')
    setTmdbResults([])
    // Small delay ensures the form is mounted and height is calculated before scrolling
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const cancelEdit = () => {
    setIsEditing(null)
    setFormData({
      type: PostType.TEXT,
      title: '',
      content: '',
      images: [],
      link: '',
      rating: undefined,
      year: undefined,
      filmTitle: undefined,
      tags: '',
      showDetails: true,
      isPoetry: false,
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

  const selectMovie = async (movie: TmdbMovie) => {
    setMovieTitle(movie.title || movie.name || '')
    const year = (movie.release_date || movie.first_air_date)?.split('-')[0]

    let tagsList = [movie.title || movie.name, year].filter(Boolean) as string[]

    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
      if (apiKey) {
        const response = await fetch(
          `https://api.themoviedb.org/3/${movie.media_type === 'tv' ? 'tv' : 'movie'}/${movie.id}/credits?api_key=${apiKey}`
        )
        if (response.ok) {
          const credits = await response.json()
          const directors = credits.crew?.filter((p: { job: string }) => p.job === 'Director').map((p: { name: string }) => p.name) || []
          const actors = credits.cast?.slice(0, 3).map((p: { name: string }) => p.name) || []
          tagsList = [...tagsList, ...directors, ...actors]
        }
      }
    } catch (e) {
      console.error("Failed to fetch movie credits", e)
    }

    setFormData(prev => ({
      ...prev,
      link: `https://www.themoviedb.org/${movie.media_type === 'tv' ? 'tv' : 'movie'}/${movie.id}`,
      images: movie.poster_path ? [`https://image.tmdb.org/t/p/original${movie.poster_path}`] : [],
      rating: movie.vote_average,
      year: year,
      filmTitle: movie.title || movie.name,
      tags: tagsList.join(', '),
    }))
    setTmdbResults([])
    setTmdbQuery('')
  }

  const handleDelete = async (id: string) => {
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
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
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
    setError,
  }
}
