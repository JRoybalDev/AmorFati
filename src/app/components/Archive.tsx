/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useMemo, useTransition, useRef, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiCalendar,
  FiTag,
  FiFilter,
  FiChevronDown,
  FiFileText,
  FiFeather,
  FiImage,
  FiFilm,
  FiX,
  FiStar,
  FiSearch,
  FiList,
  FiGrid,
  FiExternalLink,
} from 'react-icons/fi'
import { FadeLoader } from 'react-spinners'

// ── Types ────────────────────────────────────────────────────────────────────

export enum PostType {
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  FILM = 'FILM',
}

export interface Post {
  id: string
  createdAt: Date | string
  updatedAt: Date | string
  type: PostType
  title?: string | null
  content?: string | null
  link?: string | null
  authorId: string
  rating?: number | null
  year?: string | null
  filmTitle?: string | null
  tags?: string | null
  showDetails?: boolean | null
  isPoetry?: boolean | null
  images: string[]
}

type FilterType = PostType | 'POETRY' | 'ALL'

interface ArchiveProps {
  posts: Post[]
}

type ViewMode = 'list' | 'grid'

// ── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function parseTags(tags?: string | null): string[] {
  if (!tags) return []
  return tags.split(',').map((t) => t.trim()).filter(Boolean)
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateLong(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function getMonthYear(date: Date | string): string {
  const d = new Date(date)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function getMonthYearKey(date: Date | string): string {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function getDisplayTitle(post: Post): string {
  if (post.type === PostType.IMAGE && post.showDetails === false) return ''
  if (post.type === PostType.FILM) return post.filmTitle ?? post.title ?? '—'
  return post.title ?? (post.content ? post.content.slice(0, 72) + '…' : '—')
}

function getThumbnail(post: Post): string | null {
  if (post.images && post.images.length > 0) return post.images[0]
  return null
}

const TYPE_LABELS: Record<Exclude<FilterType, 'ALL'>, string> = {
  [PostType.IMAGE]: 'Gallery',
  [PostType.TEXT]: 'Text',
  [PostType.FILM]: 'Film',
  POETRY: 'Poetry',
}

const TYPE_ICONS: Record<FilterType, React.ReactNode> = {
  ALL: <FiFilter size={12} />,
  [PostType.IMAGE]: <FiImage size={12} />,
  [PostType.TEXT]: <FiFileText size={12} />,
  [PostType.FILM]: <FiFilm size={12} />,
  POETRY: <FiFeather size={12} />,
}

// ── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ rating, size = 10 }: { rating: number; size?: number }) {
  const filled = Math.round(Math.min(Math.max(rating, 0), 10) / 2)
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar
          key={i}
          size={size}
          className={i < filled ? 'fill-[#BE5103] text-[#BE5103]' : 'text-[#9B4000]/25'}
        />
      ))}
      <span className="ml-1 text-h4Mob text-[#9B4000]/60" style={{ fontFamily: "'Texturina', serif" }}>
        {rating}/10
      </span>
    </span>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const filterBtnCls = `
  flex items-center gap-2 px-3 py-1.5 rounded
  text-xs font-medium tracking-wide
  bg-[#FFF5D6] border border-[#9B4000]/30
  text-[#712F00] hover:bg-[#9B4000]/10 hover:border-[#9B4000]/60
  transition-all duration-150 select-none
`

const dropdownPanelCls = `
  absolute top-full mt-1.5 left-0 z-50 min-w-[180px]
  bg-[#FFF5D6] border border-[#9B4000]/40 rounded shadow-lg shadow-[#9B4000]/10
`

const dropdownItemCls = (active: boolean) => `
  w-full text-left px-4 py-2 text-xs flex items-center gap-2
  transition-colors duration-100 cursor-pointer
  ${active
    ? 'text-[#712F00] font-bold bg-[#BE5103]/10'
    : 'text-[#180f00]/70 hover:bg-[#BE5103]/8 hover:text-[#712F00]'}
`

// ── Dropdown ─────────────────────────────────────────────────────────────────

interface DropdownProps {
  label: React.ReactNode
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}

function Dropdown({ label, children, isOpen, onToggle }: DropdownProps) {
  return (
    <div className="relative">
      <button onClick={onToggle} className={filterBtnCls} style={{ fontFamily: "'Texturina', serif" }}>
        {label}
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <FiChevronDown size={12} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={dropdownPanelCls}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Tag Pill ─────────────────────────────────────────────────────────────────

function TagPill({ tag, onRemove }: { tag: string; onRemove: () => void }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-h4Mob
        bg-[#BE5103]/15 text-[#712F00] border border-[#BE5103]/30"
      style={{ fontFamily: "'Texturina', serif" }}
    >
      #{tag}
      <button onClick={onRemove} className="hover:text-[#9B4000] transition-colors">
        <FiX size={10} />
      </button>
    </motion.span>
  )
}

// ── Skeleton Loading ──────────────────────────────────────────────────────────

// const shimmer = `animate-pulse bg-[#9B4000]/10`

// function SkeletonRow() {
//   return (
//     <div className="flex items-start gap-4 py-3 border-b border-[#9B4000]/10 last:border-0">
//       <div className={`shrink-0 h-3 w-10 rounded ${shimmer}`} />
//       <div className={`shrink-0 w-1 h-1 rounded-full mt-2 ${shimmer}`} />
//       <div className={`shrink-0 w-10 h-10 rounded ${shimmer}`} />
//       <div className="flex-1 space-y-1.5">
//         <div className={`h-3 rounded ${shimmer}`} style={{ width: '60%' }} />
//         <div className={`h-2.5 rounded ${shimmer}`} style={{ width: '35%' }} />
//       </div>
//       <div className={`shrink-0 h-4 w-12 rounded ${shimmer}`} />
//     </div>
//   )
// }

// function SkeletonCard() {
//   return (
//     <div className={`rounded-lg overflow-hidden border border-[#9B4000]/10`}>
//       <div className={`w-full h-40 ${shimmer}`} />
//       <div className="p-3 space-y-2">
//         <div className={`h-3 rounded ${shimmer}`} style={{ width: '70%' }} />
//         <div className={`h-2.5 rounded ${shimmer}`} style={{ width: '45%' }} />
//         <div className={`h-2.5 rounded ${shimmer}`} style={{ width: '30%' }} />
//       </div>
//     </div>
//   )
// }

// ── Thumbnail ─────────────────────────────────────────────────────────────────

function Thumbnail({ post, className = '' }: { post: Post; className?: string }) {
  const src = getThumbnail(post)

  if (src) {
    return (
      <div className={`relative overflow-hidden bg-[#9B4000]/10 ${className}`}>
        <img
          src={src}
          alt={getDisplayTitle(post)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  // Placeholder by type
  const icons: Record<PostType, React.ReactNode> = {
    [PostType.IMAGE]: <FiImage size={18} className="text-[#9B4000]/30" />,
    [PostType.TEXT]: <FiFileText size={18} className="text-[#9B4000]/30" />,
    [PostType.FILM]: <FiFilm size={18} className="text-[#9B4000]/30" />,
  }

  return (
    <div className={`flex items-center justify-center bg-[#9B4000]/8 ${className}`}>
      {icons[post.type]}
    </div>
  )
}

// ── Post Row (List view) ──────────────────────────────────────────────────────

const PostRow = memo(({ post, index, onClick }: { post: Post; index: number; onClick: () => void }) => {
  const displayTitle = getDisplayTitle(post)
  const plainContent = useMemo(() => post.content ? post.content.replace(/<[^>]*>/g, '') : '', [post.content])
  const isPoetry = post.type === PostType.TEXT && post.isPoetry
  const label = post.type === PostType.IMAGE ? 'Gallery' : (post.type === PostType.FILM ? 'Film' : (isPoetry ? 'Poetry' : 'Text'))
  const isTruncated = plainContent.length > 180

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200,
        delay: index * 0.04
      }}
      onClick={onClick}
      className="group flex items-start gap-4 py-3 border-b border-[#9B4000]/10 last:border-0
        hover:bg-[#BE5103]/5 -mx-2 px-2 rounded transition-colors duration-150 cursor-pointer"
    >
      {/* Date */}
      <span
        className="shrink-0 w-14 text-right text-h4Mob text-[#9B4000]/55 pt-0.5 tabular-nums"
        style={{ fontFamily: "'Texturina', serif" }}
      >
        {formatDate(post.createdAt)}
      </span>

      {/* Ornament dot */}
      <span className="shrink-0 w-1 h-1 rounded-full bg-[#BE5103]/50 mt-2.5" />

      {/* Thumbnail */}
      {post.type !== PostType.TEXT && (
        <Thumbnail
          post={post}
          className="shrink-0 w-10 h-10 rounded overflow-hidden"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {displayTitle && (
          <p
            className="text-sm text-BGpageDark group-hover:text-[#712F00]
              transition-colors duration-150 truncate leading-snug"
            style={{ fontFamily: "'Texturina', serif", fontStyle: 'italic', fontWeight: 600 }}
          >
            {displayTitle}
          </p>
        )}

        {post.type === PostType.FILM && (post.year || post.rating != null) && (
          <div className="flex items-center gap-2 mt-0.5">
            {post.year && (
              <span className="text-h4Mob text-[#9B4000]/55" style={{ fontFamily: "'Texturina', serif" }}>
                {post.year}
              </span>
            )}
            {post.rating != null && <StarRating rating={post.rating} />}
          </div>
        )}

        {(post.type === PostType.TEXT || post.type === PostType.FILM) && plainContent && (
          <>
            <p className="text-[11px] text-BGpageDark/50 mt-0.5 line-clamp-3 italic leading-snug">
              {plainContent}
            </p>
            {isTruncated && (
              <span className="text-[9px] text-[#BE5103] font-bold uppercase tracking-tighter mt-1 block">Click to read more</span>
            )}
          </>
        )}
      </div>

      {/* Type badge */}
      <span
        className="shrink-0 flex items-center gap-1 text-[9px] px-2 py-0.5 rounded
          border border-[#9B4000]/25 text-[#9B4000]/55 uppercase tracking-widest"
        style={{ fontFamily: "'Texturina', serif" }}
      >
        {isPoetry ? <FiFeather size={12} /> : TYPE_ICONS[post.type]}
        {label}
      </span>
    </motion.div>
  )
})
PostRow.displayName = 'PostRow'

// ── Grid Card ─────────────────────────────────────────────────────────────────

const GridCard = memo(({ post, index, onClick }: { post: Post; index: number; onClick: () => void }) => {
  const displayTitle = getDisplayTitle(post)
  const plainContent = useMemo(() => post.content ? post.content.replace(/<[^>]*>/g, '') : '', [post.content])
  const isPoetry = post.type === PostType.TEXT && post.isPoetry
  const label = post.type === PostType.IMAGE ? 'Gallery' : (post.type === PostType.FILM ? 'Film' : (isPoetry ? 'Poetry' : 'Text'))
  const isTruncated = plainContent.length > 350

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 150,
        delay: index * 0.05
      }}
      onClick={onClick}
      className="group relative flex flex-col rounded-lg overflow-hidden cursor-pointer
        bg-BGpage border border-[#9B4000]/15 shadow-sm shadow-[#9B4000]/5
        hover:border-[#9B4000]/40 hover:shadow-md hover:shadow-[#9B4000]/10
        transition-all duration-200"
    >
      {/* Thumbnail */}
      {post.type !== PostType.TEXT && <Thumbnail post={post} className="w-full h-40" />}

      {/* Type badge — overlaid on thumbnail */}
      <span
        className="absolute top-2 right-2 flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded
          bg-BGpage/90 backdrop-blur-sm border border-[#9B4000]/25
          text-[#9B4000]/70 uppercase tracking-widest"
        style={{ fontFamily: "'Texturina', serif" }}
      >
        {isPoetry ? <FiFeather size={12} /> : TYPE_ICONS[post.type]}
        {label}
      </span>

      {/* Content */}
      <div className={`p-3 flex-1 flex flex-col gap-1.5 ${post.type === PostType.TEXT ? 'pt-10' : ''}`}>
        {displayTitle && (
          <p
            className="text-xs text-BGpageDark group-hover:text-[#712F00] leading-snug
              transition-colors duration-150 line-clamp-2"
            style={{ fontFamily: "'Texturina', serif", fontStyle: 'italic', fontWeight: 700 }}
          >
            {displayTitle}
          </p>
        )}

        {post.type === PostType.FILM && (post.year || post.rating != null) && (
          <div className="flex items-center gap-2">
            {post.year && (
              <span className="text-[9px] text-[#9B4000]/55" style={{ fontFamily: "'Texturina', serif" }}>
                {post.year}
              </span>
            )}
            {post.rating != null && <StarRating rating={post.rating} size={9} />}
          </div>
        )}

        {(post.type === PostType.TEXT || post.type === PostType.FILM) && plainContent && (
          <>
            <p className={`text-h4Mob text-BGpageDark/50 leading-relaxed italic ${post.type === PostType.TEXT ? 'line-clamp-8' : 'line-clamp-2'}`}>
              {plainContent}
            </p>
            {isTruncated && (
              <span className="text-[9px] text-[#BE5103] font-bold uppercase tracking-tighter mt-auto pt-1">Click to read more</span>
            )}
          </>
        )}

        <div className="mt-auto pt-1.5 flex items-center">
          <span
            className="text-[9px] text-[#9B4000]/40 tabular-nums"
            style={{ fontFamily: "'Texturina', serif" }}
          >
            {formatDate(post.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  )
})
GridCard.displayName = 'GridCard'

// ── Month Section ─────────────────────────────────────────────────────────────

const MonthSection = memo(({ monthYear, posts, sectionIndex, viewMode, onPostClick }: {
  monthYear: string
  posts: Post[]
  sectionIndex: number
  viewMode: ViewMode
  onPostClick: (post: Post) => void
}) => {
  const [month, year] = monthYear.split(' ')

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        damping: 28,
        stiffness: 180,
        delay: sectionIndex * 0.08
      }}
      className="mb-10"
    >
      <div className="flex items-baseline gap-3 mb-3">
        <h2
          className="text-xl text-BGpageDark"
          style={{ fontFamily: "'Pirata One', serif" }}
        >
          {month}
        </h2>
        <span
          className="text-xs text-[#9B4000]/50"
          style={{ fontFamily: "'Texturina', serif" }}
        >
          {year}
        </span>
        <div className="flex-1 flex items-center gap-1.5 ml-1">
          <div className="h-px flex-1 bg-[#9B4000]/20" />
          <span className="text-[#BE5103]/35 text-xs leading-none">✦</span>
          <div className="h-px w-3 bg-[#9B4000]/20" />
        </div>
        <span
          className="text-h4Mob text-[#9B4000]/40 tabular-nums"
          style={{ fontFamily: "'Texturina', serif" }}
        >
          {posts.length} {posts.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {viewMode === 'list' ? (
          posts.map((post, i) => (
            <PostRow key={post.id} post={post} index={i} onClick={() => onPostClick(post)} />
          ))
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {posts.map((post, i) => (
              <GridCard key={post.id} post={post} index={i} onClick={() => onPostClick(post)} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  )
})
MonthSection.displayName = 'MonthSection'

// ── Tags Dropdown ─────────────────────────────────────────────────────────────

function TagsDropdown({ allTags, tagCounts, selectedTags, toggleTag, isOpen, onToggle }: {
  allTags: string[]
  tagCounts: Record<string, number>
  selectedTags: string[]
  toggleTag: (tag: string) => void
  isOpen: boolean
  onToggle: () => void
}) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
    else setSearch('')
  }, [isOpen])

  const visibleTags = useMemo(() => {
    const q = search.toLowerCase().trim()
    return q ? allTags.filter((t) => t.toLowerCase().includes(q)) : allTags
  }, [allTags, search])

  return (
    <div className="relative">
      <button onClick={onToggle} className={filterBtnCls} style={{ fontFamily: "'Texturina', serif" }}>
        <FiTag size={12} />
        <span className="hidden md:inline">
          {selectedTags.length > 0
            ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`
            : 'Tags'}
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <FiChevronDown size={12} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`${dropdownPanelCls} w-52`}
          >
            <div className="px-3 pt-2.5 pb-2 border-b border-[#9B4000]/15">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded
                bg-[#9B4000]/8 border border-[#9B4000]/15">
                <FiSearch size={11} className="text-[#9B4000]/50 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tags…"
                  className="flex-1 bg-transparent text-[11px] text-BGpageDark outline-none
                    placeholder:text-[#9B4000]/40"
                  style={{ fontFamily: "'Texturina', serif" }}
                  onClick={(e) => e.stopPropagation()}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-[#9B4000]/40 hover:text-[#9B4000]">
                    <FiX size={10} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto py-1">
              {visibleTags.length === 0 ? (
                <p className="px-4 py-3 text-[11px] text-[#9B4000]/40 text-center"
                  style={{ fontFamily: "'Texturina', serif" }}>
                  No tags found
                </p>
              ) : visibleTags.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center justify-between gap-2 px-3 py-1.5
                    hover:bg-[#BE5103]/8 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      style={{ accentColor: '#BE5103' }}
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                    />
                    <span className="text-[11px] text-BGpageDark/75 truncate"
                      style={{ fontFamily: "'Texturina', serif" }}>
                      #{tag}
                    </span>
                  </div>
                  <span className="text-[9px] text-[#9B4000]/40 shrink-0 tabular-nums">
                    {tagCounts[tag]}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Post Modal ────────────────────────────────────────────────────────────────

function PostModal({ post, onClose, isMobile }: { post: Post; onClose: () => void; isMobile: boolean }) {
  const tags = parseTags(post.tags)
  const displayTitle = getDisplayTitle(post)
  const [activeImage, setActiveImage] = useState(0)
  const [isTagsExpanded, setIsTagsExpanded] = useState(false)
  const showDetails = !(post.type === PostType.IMAGE && post.showDetails === false)
  const isFilmDesktop = post.type === PostType.FILM && !isMobile
  const isPoetry = post.type === PostType.TEXT && post.isPoetry
  const label = post.type === PostType.IMAGE ? 'Gallery' : (post.type === PostType.FILM ? 'Film' : (isPoetry ? 'Poetry' : 'Text'))
  const isTextOrPoetry = post.type === PostType.TEXT || isPoetry

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-BGpageDark/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel — slides from right on md+, from bottom on mobile */}
      <motion.div
        initial={isMobile ? { y: '100%' } : { x: '100%', opacity: 0 }}
        animate={isMobile ? { y: 0 } : { x: 0, opacity: 1 }}
        exit={isMobile ? { y: '100%' } : { x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
        className={`fixed z-50 bg-BGpage shadow-2xl shadow-BGpageDark/30
          flex flex-col overflow-hidden transition-[width] duration-300
          bottom-0 left-0 right-0 rounded-t-2xl max-h-[88dvh]
          md:right-0 md:left-auto md:transition-all
          ${isFilmDesktop
            ? 'md:top-6 md:h-fit md:max-h-[94vh] md:w-[850px] md:max-w-[90vw] md:rounded-2xl md:right-6'
            : `md:inset-y-0 md:top-0 md:h-screen md:w-fit md:min-w-[400px] ${isTextOrPoetry ? 'md:max-w-[30vw]' : 'md:max-w-[65vw]'} md:rounded-none md:rounded-l-2xl`
          }`}
      >
        {/* Mobile pull handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-[#9B4000]/25" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4
          border-b border-[#9B4000]/15 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded
                  border border-[#9B4000]/25 text-[#9B4000]/55 uppercase tracking-widest"
                style={{ fontFamily: "'Texturina', serif" }}
              >
                {isPoetry ? <FiFeather size={12} /> : TYPE_ICONS[post.type]}
                {label}
              </span>
              <span
                className="text-h4Mob text-[#9B4000]/40"
                style={{ fontFamily: "'Texturina', serif" }}
              >
                {formatDateLong(post.createdAt)}
              </span>
            </div>
            <h2
              className="text-lg leading-snug text-BGpageDark"
              style={{ fontFamily: "'Pirata One', serif" }}
            >
              {showDetails ? displayTitle : 'Image Entry'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-lg text-[#9B4000]/50 hover:text-[#712F00]
              hover:bg-[#9B4000]/10 transition-colors mt-0.5"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        < div className={`flex-1 overflow-y-auto ${isFilmDesktop ? 'md:flex md:flex-row md:overflow-hidden' : ''}`
        }>

          {/* Left Side: Poster (Desktop Film only) */}
          {
            isFilmDesktop && post.images?.[0] && (
              <div className="md:w-[380px] md:shrink-0 bg-BGpageDark/5 border-r border-[#9B4000]/10 overflow-hidden">
                <img
                  src={post.images[0]}
                  alt={post.filmTitle || 'Poster'}
                  className="w-full h-auto block"
                />
              </div>
            )
          }

          {/* Right Side: Content */}
          <div className={`flex-1 ${isFilmDesktop ? 'md:overflow-y-auto' : ''}`}>
            {/* Image gallery (Hidden for Film on Desktop as we use the split layout) */}
            {post.images && post.images.length > 0 && !isFilmDesktop && (
              <div className="shrink-0 flex flex-col">
                <div
                  className="relative bg-BGpageDark/5 overflow-hidden flex items-center justify-center"
                  style={{ aspectRatio: '16/9', height: isMobile ? 'auto' : '65vh' }}
                >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={post.images[activeImage]}
                    alt={`Image ${activeImage + 1}`}
                      className="w-full h-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                </AnimatePresence>
              </div>

              {post.images.length > 1 && (
                <div className="flex gap-1.5 px-6 py-3 overflow-x-auto">
                  {post.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all
                        ${i === activeImage
                          ? 'border-[#BE5103] opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-80'}`}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Film details */}
          {post.type === PostType.FILM && (
            <div className="px-6 py-4 border-b border-[#9B4000]/10">
              <div className="flex items-center gap-4 flex-wrap">
                {post.year && (
                  <div>
                    <p className="text-[9px] text-[#9B4000]/40 uppercase tracking-widest mb-0.5"
                      style={{ fontFamily: "'Texturina', serif" }}>Year</p>
                    <p className="text-sm text-BGpageDark" style={{ fontFamily: "'Texturina', serif" }}>
                      {post.year}
                    </p>
                  </div>
                )}
                {post.rating != null && (
                  <div>
                    <p className="text-[9px] text-[#9B4000]/40 uppercase tracking-widest mb-0.5"
                      style={{ fontFamily: "'Texturina', serif" }}>Rating</p>
                    <StarRating rating={post.rating} size={12} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content body */}
            {post.content && showDetails && (
            <div className="px-6 py-5 border-b border-[#9B4000]/10">
              <p className="text-[9px] text-[#9B4000]/40 uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Texturina', serif" }}>
                {post.type === PostType.TEXT ? 'Note' : 'Description'}
              </p>
              <div
                className="text-sm text-BGpageDark/80 leading-relaxed rich-content"
                style={{ fontFamily: "'Texturina', serif" }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          )}

          {/* Link */}
          {post.link && (
            <div className="px-6 py-4 border-b border-[#9B4000]/10">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#BE5103] hover:text-[#712F00]
                  underline underline-offset-2 transition-colors"
                style={{ fontFamily: "'Texturina', serif" }}
              >
                <FiExternalLink size={12} />
                {post.link}
              </a>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-[9px] text-[#9B4000]/40 uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Texturina', serif" }}>Tags</p>
                <div className="flex items-center gap-2 min-w-0">
                  <motion.div
                    initial={false}
                    animate={{ height: isTagsExpanded ? 'auto' : 32 }}
                    className="flex flex-wrap items-center gap-1.5 overflow-hidden flex-1"
                  >
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-h4Mob px-2 py-1 rounded
                        bg-[#9B4000]/10 text-[#9B4000]/70 border border-[#9B4000]/15"
                        style={{ fontFamily: "'Texturina', serif" }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </motion.div>

                  <button
                    onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                    className="shrink-0 p-1 hover:bg-[#9B4000]/10 rounded-full transition-colors text-[#9B4000]/40"
                  >
                    <motion.div animate={{ rotate: isTagsExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <FiChevronDown size={14} />
                    </motion.div>
                  </button>
              </div>
            </div>
          )}

          {/* Bottom padding for mobile safe area */}
          <div className="h-6 md:h-2" />
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ── View Toggle ───────────────────────────────────────────────────────────────

function ViewToggle({ viewMode, onChange, disabled }: { viewMode: ViewMode; onChange: (v: ViewMode) => void; disabled?: boolean }) {
  return (
    <div className={`flex items-center gap-0.5 ml-auto p-0.5 rounded bg-[#9B4000]/10 border border-[#9B4000]/20 transition-opacity duration-200 ${disabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <button
        disabled={disabled}
        onClick={() => onChange('list')}
        className={`p-1.5 rounded transition-all duration-150 ${
          viewMode === 'list'
            ? 'bg-BGpage text-[#712F00] shadow-sm border border-[#9B4000]/25'
            : 'text-[#9B4000]/40 hover:text-[#9B4000]/70'
        }`}
        title="List view"
      >
        <FiList size={13} />
      </button>
      <button
        disabled={disabled}
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded transition-all duration-150 ${
          viewMode === 'grid'
            ? 'bg-BGpage text-[#712F00] shadow-sm border border-[#9B4000]/25'
            : 'text-[#9B4000]/40 hover:text-[#9B4000]/70'
        }`}
        title="Grid view"
      >
        <FiGrid size={13} />
      </button>
    </div>
  )
}

// ── Archive ───────────────────────────────────────────────────────────────────

function Archive({ posts }: ArchiveProps) {
  const [isPending, startTransition] = useTransition()
  const [openDropdown, setOpenDropdown] = useState<'month' | 'type' | 'tags' | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<FilterType>('ALL')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [appliedMonthKey, setAppliedMonthKey] = useState<string | null>(null)
  const [appliedType, setAppliedType] = useState<FilterType>('ALL')
  const [appliedTags, setAppliedTags] = useState<string[]>([])

  const [isTagsExpanded, setIsTagsExpanded] = useState(false)

  // Infinite Scroll State
  const [displayLimit, setDisplayLimit] = useState(3)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const INITIAL_LIMIT = 3

  // Mobile detection - moved to parent to ensure modal animations are stable on mount
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mql.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const availableMonths = useMemo(() => {
    const seen = new Set<string>()
    const result: { key: string; label: string }[] = []
    ;[...posts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .forEach((p) => {
        const key = getMonthYearKey(p.createdAt)
        if (!seen.has(key)) { seen.add(key); result.push({ key, label: getMonthYear(p.createdAt) }) }
      })
    return result
  }, [posts])

  const { allTags, tagCounts } = useMemo(() => {
    const counts: Record<string, number> = {}
    posts.forEach((p) => parseTags(p.tags).forEach((t) => { counts[t] = (counts[t] ?? 0) + 1 }))
    return { allTags: Object.keys(counts).sort((a, b) => counts[b] - counts[a]), tagCounts: counts }
  }, [posts])

  const filteredPosts = useMemo(() => posts.filter((post) => {
    const monthMatch = !appliedMonthKey || getMonthYearKey(post.createdAt) === appliedMonthKey
    const typeMatch = appliedType === 'ALL' ||
      (appliedType === 'POETRY'
        ? (post.type === PostType.TEXT && post.isPoetry)
        : (appliedType === PostType.TEXT
          ? (post.type === PostType.TEXT && !post.isPoetry)
          : post.type === appliedType))
    const postTags = parseTags(post.tags)
    const tagMatch = appliedTags.length === 0 || appliedTags.every((t) => postTags.includes(t))
    return monthMatch && typeMatch && tagMatch
  }), [posts, appliedMonthKey, appliedType, appliedTags])

  const groupedPosts = useMemo(() => {
    const map = new Map<string, Post[]>()
    ;[...filteredPosts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .forEach((post) => {
        const key = getMonthYearKey(post.createdAt)
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(post)
      })
    return Array.from(map.entries()).map(([key, postsInMonth]) => ({
      key, label: getMonthYear(postsInMonth[0].createdAt), posts: postsInMonth,
    }))
  }, [filteredPosts])

  const applyFilters = (monthKey: string | null, type: FilterType, tags: string[]) => {
    startTransition(() => {
      setAppliedMonthKey(monthKey)
      setAppliedType(type)
      setAppliedTags(tags)
      setDisplayLimit(INITIAL_LIMIT)
    })
  }

  // Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isPending && displayLimit < groupedPosts.length) {
          setDisplayLimit((prev) => prev + 2)
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [isPending, displayLimit, groupedPosts.length])

  const toggleDropdown = (key: 'month' | 'type' | 'tags') =>
    setOpenDropdown((prev) => (prev === key ? null : key))

  const handlePostClick = useCallback((post: Post) => {
    setSelectedPost(post)
    setOpenDropdown(null)
  }, [])

  const setMonth = (key: string | null) => {
    setSelectedMonthKey(key); setOpenDropdown(null)
    applyFilters(key, selectedType, selectedTags)
  }
  const setType = (type: FilterType) => {
    setSelectedType(type); setOpenDropdown(null)
    applyFilters(selectedMonthKey, type, selectedTags)
  }
  const toggleTag = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    setSelectedTags(next)
    applyFilters(selectedMonthKey, selectedType, next)
  }
  const clearAll = () => {
    setSelectedMonthKey(null); setSelectedType('ALL'); setSelectedTags([])
    startTransition(() => {
      applyFilters(null, 'ALL', [])
      setDisplayLimit(INITIAL_LIMIT)
      setIsTagsExpanded(false)
    })
  }

  const hasActiveFilters = selectedMonthKey !== null || selectedType !== 'ALL' || selectedTags.length > 0
  const typeLabel = selectedType === 'ALL' ? 'Type' : TYPE_LABELS[selectedType as PostType]

  return (
    <div onClick={() => setOpenDropdown(null)}>

      {/* ── Filter bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="sticky top-4 z-40 mb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 rounded
          bg-BGpage/90 backdrop-blur-sm
          border border-[#9B4000]/20 shadow-sm shadow-[#9B4000]/10">

          {/* Month */}
          <Dropdown
            label={
              <span className="flex items-center gap-1.5">
                <FiCalendar size={12} />
                <span className="hidden md:inline">
                  {selectedMonthKey
                    ? availableMonths.find((m) => m.key === selectedMonthKey)?.label
                    : 'Month'}
                </span>
              </span>
            }
            isOpen={openDropdown === 'month'}
            onToggle={() => toggleDropdown('month')}
          >
            <div className="py-1 max-h-56 overflow-y-auto">
              <button onClick={() => setMonth(null)} className={dropdownItemCls(!selectedMonthKey)}
                style={{ fontFamily: "'Texturina', serif" }}>
                All months
              </button>
              {availableMonths.map((m) => (
                <button key={m.key} onClick={() => setMonth(m.key)}
                  className={dropdownItemCls(selectedMonthKey === m.key)}
                  style={{ fontFamily: "'Texturina', serif" }}>
                  {m.label}
                </button>
              ))}
            </div>
          </Dropdown>

          {/* Type */}
          <Dropdown
            label={<span className="flex items-center gap-1.5">{TYPE_ICONS[selectedType]}<span className="hidden md:inline">{typeLabel}</span></span>}
            isOpen={openDropdown === 'type'}
            onToggle={() => toggleDropdown('type')}
          >
            <div className="py-1">
              <button onClick={() => setType('ALL')} className={dropdownItemCls(selectedType === 'ALL')}
                style={{ fontFamily: "'Texturina', serif" }}>
                <FiFilter size={12} /> All
              </button>
              {['IMAGE', 'TEXT', 'POETRY', 'FILM'].map((type) => (
                <button key={type} onClick={() => setType(type as FilterType)}
                  className={dropdownItemCls(selectedType === type)}
                  style={{ fontFamily: "'Texturina', serif" }}>
                  {TYPE_ICONS[type as FilterType]}{TYPE_LABELS[type as Exclude<FilterType, 'ALL'>]}
                </button>
              ))}
            </div>
          </Dropdown>

          {/* Tags */}
          {allTags.length > 0 && (
            <TagsDropdown
              allTags={allTags} tagCounts={tagCounts}
              selectedTags={selectedTags} toggleTag={toggleTag}
              isOpen={openDropdown === 'tags'} onToggle={() => toggleDropdown('tags')}
            />
          )}

          {/* Active tag pills */}
          <div className="flex flex-1 items-center gap-1.5 min-w-0">
            <motion.div
              initial={false}
              animate={{ height: isTagsExpanded ? 'auto' : 32 }}
              className="flex flex-wrap items-center gap-2 overflow-hidden px-0.5"
            >
              <AnimatePresence mode="popLayout">
                {selectedTags.map((tag) => (
                  <TagPill key={tag} tag={tag} onRemove={() => toggleTag(tag)} />
                ))}
              </AnimatePresence>
            </motion.div>

            {selectedTags.length > 0 && (
              <button
                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                className="shrink-0 p-1 hover:bg-[#9B4000]/10 rounded-full transition-colors text-[#9B4000]/40"
              >
                <motion.div animate={{ rotate: isTagsExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FiChevronDown size={14} />
                </motion.div>
              </button>
            )}
          </div>

          {/* Clear */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={clearAll}
                className="flex items-center gap-1 text-h4Mob text-[#9B4000]/50
                  hover:text-[#712F00] transition-colors"
                style={{ fontFamily: "'Texturina', serif" }}
              >
                <FiX size={11} /> clear
              </motion.button>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="w-px h-4 bg-[#9B4000]/20 mx-1" />

          {/* View toggle — far right */}
          <ViewToggle
            viewMode={viewMode}
            onChange={(v) => startTransition(() => {
              setViewMode(v)
              setDisplayLimit(INITIAL_LIMIT)
            })}
            disabled={isPending}
          />
        </div>
      </motion.div>

      {/* ── Content ── */}
      <AnimatePresence mode="popLayout">
        {isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-40 w-full"
          >
            <FadeLoader color="#BE5103" />
          </motion.div>
        ) : groupedPosts.length > 0 ? (
            <motion.div
              key={`results-${appliedMonthKey}-${appliedType}-${appliedTags.join(',')}-${viewMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1] // Custom ease-out quint for smoother feel
              }}
            >
              {groupedPosts.slice(0, displayLimit).map((group, i) => (
              <MonthSection
                key={group.key}
                monthYear={group.label}
                posts={group.posts}
                sectionIndex={i}
                viewMode={viewMode}
                onPostClick={handlePostClick}
              />
            ))}

              {/* Sentinel for Infinite Scroll */}
              <div ref={loadMoreRef} className="h-32 w-full flex items-center justify-center">
                {displayLimit < groupedPosts.length && (
                  <FadeLoader color="#BE5103" height={12} width={3} radius={1} margin={-2} />
                )}
              </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-24">
            <p className="text-3xl text-BGpageDark/10 mb-2" style={{ fontFamily: "'Pirata One', serif" }}>
              Nothing here.
            </p>
            <p className="text-xs text-[#9B4000]/40" style={{ fontFamily: "'Texturina', serif" }}>
              Try adjusting your filters.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Post Modal ── */}
      <AnimatePresence>
        {selectedPost && (
          <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} isMobile={isMobile} />
        )}
      </AnimatePresence>

    </div>
  )
}

export default Archive
