'use client'

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Star, ChevronDown } from 'lucide-react'
import { renderRichContent } from '@/lib/render-rich-content'
import { CldImage } from 'next-cloudinary'

export interface PostProps {
  type: 'TEXT' | 'IMAGE' | 'FILM'
  title?: string
  content?: string
  link?: string
  images?: string[]
  createdAt?: string | Date
  rating?: number
  year?: string | number
  filmTitle?: string
  tags?: string
  isPoetry?: boolean
  showDetails?: boolean
  children?: React.ReactNode
}

const POST_VARIANTS = {
  TEXT: {
    container: 'flex flex-col items-start rounded-2xl',
    imageContainer: '',
    image: '',
    content: 'flex flex-col',
    footer: '',
  },
  IMAGE: {
    container: 'flex flex-col items-start rounded-2xl',
    imageContainer: 'w-full relative overflow-hidden',
    image: '',
    content: 'flex flex-col',
    footer: '',
  },
  FILM: {
    container: 'flex flex-col items-start rounded-2xl',
    imageContainer: 'w-full relative overflow-hidden rounded-t-2xl',
    image: 'w-full object-cover',
    content: 'flex flex-1 flex-col',
    footer: '',
  },
}

export function Post({
  type,
  title,
  content,
  images,
  link,
  createdAt,
  rating,
  year,
  filmTitle,
  tags,
  isPoetry,
  showDetails = true,
  children,
}: PostProps) {
  const displayImages = images || []
  const isGallery = type === 'IMAGE' && displayImages.length > 1
  const [isExpanded, setIsExpanded] = useState(false)
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false)
  const [isFirstImageSquare, setIsFirstImageSquare] = useState(false)
  const [isTagsExpanded, setIsTagsExpanded] = useState(false)
  const [hasMoreTags, setHasMoreTags] = useState(false)
  const CHARACTER_LIMIT = (type === 'IMAGE' ? 250 : 450)
  const postRef = useRef<HTMLDivElement>(null)
  const tagsRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)
  const prevHeight = useRef<number | null>(null)

  useEffect(() => {
    window.dispatchEvent(new Event('resize'))
  }, [isExpanded, isGalleryExpanded, isFirstImageSquare])

  useLayoutEffect(() => {
    const element = postRef.current
    if (!element || isInitialMount.current) {
      if (element) prevHeight.current = element.offsetHeight
      return
    }

    const currentHeight = element.offsetHeight

    if (prevHeight.current !== null && prevHeight.current !== currentHeight) {
      element.animate(
        [
          { height: `${prevHeight.current}px` },
          { height: `${currentHeight}px` }
        ],
        {
          duration: 400,
          easing: 'cubic-bezier(0.4, 0, 0.1, 1)'
        }
      )
    }

    prevHeight.current = currentHeight
  }, [isGalleryExpanded])

  useLayoutEffect(() => {
    const checkOverflow = () => {
      if (tagsRef.current) {
        // The collapsed height is 28px; anything larger indicates multiple lines
        setHasMoreTags(tagsRef.current.scrollHeight > 28)
      }
    }
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [tags])

  // Use the first image for single view or cover checks
  const firstImage = displayImages[0]

  const typeLabel = type === 'IMAGE' ? 'Gallery' : (type === 'FILM' ? 'Film' : (isPoetry ? 'Poetry' : 'Text'))

  const timeAgo = (date: string | Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const styles = POST_VARIANTS[type]

  const shouldTruncate = content && content.length > CHARACTER_LIMIT

  const contentRef = useRef<HTMLParagraphElement>(null)
  const [contentHeight, setContentHeight] = useState<number | null>(null)

  useEffect(() => {
    if (contentRef.current && shouldTruncate) {
      const fullHeight = contentRef.current.scrollHeight
      setContentHeight(fullHeight)
    }
  }, [content, shouldTruncate])

  const galleryRef = useRef<HTMLDivElement>(null)
  const [galleryHeight, setGalleryHeight] = useState<number | null>(null)



  return (
    <div ref={postRef} className={`group relative overflow-hidden bg-white shadow-sm transition-all hover:shadow-md border border-gray-100 ${styles.container}`}>
      {/* Image Section */}
      {firstImage && type !== 'TEXT' ? (
        <div className={`relative bg-gray-100 group/image ${styles.imageContainer}`}>
          {type === 'FILM' ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full relative">
              <CldImage
                src={firstImage}
                alt={filmTitle || title || 'Film poster'}
                width={600}
                height={900}
                deliveryType={firstImage.includes('cloudinary.com') ? 'upload' : 'fetch'}
                className="w-full block object-cover h-auto"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <h3 className="text-lg font-bold leading-tight drop-shadow-md">{filmTitle}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs font-medium text-white/90">
                  {rating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={12} fill="currentColor" />
                      <span>{rating.toFixed(1)}</span>
                    </div>
                  )}
                  {year && <span>{year}</span>}
                </div>
              </div>
            </a>
          ) : type === 'IMAGE' ? (
            <>
                {isGallery ? (
                  <div
                    ref={galleryRef}
                    style={{
                      overflow: 'hidden',
                      transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      maxHeight: isGalleryExpanded
                        ? `${galleryHeight ?? 9999}px`
                        : '500px',
                    }}
                  >
                    <div className="grid grid-cols-1 gap-0.5">
                      {displayImages.map((img, idx) => (
                        <CldImage
                        key={idx}
                        src={img}
                        alt={title || `Gallery image ${idx + 1}`}
                        width={1200}
                        height={idx === 0 && isFirstImageSquare ? 1200 : 800}
                        crop="limit"
                        deliveryType={img.includes('cloudinary.com') ? 'upload' : 'fetch'}
                        className={`w-full h-auto object-cover block ${idx === 0 && isFirstImageSquare ? 'col-span-2' : ''}`}
                        onLoad={idx === 0 ? (e) => {
                          const imgElement = e.target as HTMLImageElement
                          if (imgElement.naturalWidth && imgElement.naturalHeight) {
                            const ratio = imgElement.naturalWidth / imgElement.naturalHeight
                            // Check if image is square (allow small tolerance)
                            if (ratio >= 0.99 && ratio <= 1.01) {
                              setIsFirstImageSquare(true)
                            }
                          }
                        } : undefined}
                      />
                    ))}
                    </div>
                    {!isGalleryExpanded && (
                      <div
                        className="absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-black/90 to-transparent flex items-end justify-center pb-4 cursor-pointer hover:from-black transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (galleryRef.current) {
                            setGalleryHeight(galleryRef.current.scrollHeight)
                          }
                          setIsGalleryExpanded(true)
                        }}
                    >
                        <span className="text-white font-bold text-lg drop-shadow-md">Expand</span>
                      </div>
                    )}
                    {isGalleryExpanded && (
                      <div
                        className="absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-black/90 to-transparent flex items-end justify-center pb-4 cursor-pointer hover:from-black transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setIsGalleryExpanded(false)
                        }}
                      >
                        <span className="text-white font-bold text-lg drop-shadow-md">Shrink</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <CldImage
                    src={firstImage}
                    alt={title || "Post image"}
                    width={1200}
                    height={800}
                    crop="limit"
                    deliveryType={firstImage.includes('cloudinary.com') ? 'upload' : 'fetch'}
                    className={`w-full block ${styles.image}`}
                  />
                )}
            </>
          ) : null}
        </div>
      ) : null}

      {/* Content Section */}
      <div className={`p-5 ${styles.content}`}>
        <div className="mb-2 flex items-center gap-2 text-h4Mob font-bold text-gray-400 uppercase tracking-wider">
          {/* Text label moved here */}
          <span className="text-gray-500">{typeLabel}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
          <span>{timeAgo(createdAt)}</span>
        </div>

        {/* Title */}
        {title && (type !== 'IMAGE' || showDetails) && (
          <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
            {title}
          </h3>
        )}

        {content && (type !== 'IMAGE' || showDetails) && (
          <div className="mb-4">
            <div
              className="relative"
              style={{
                overflow: 'hidden',
                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                maxHeight: shouldTruncate
                  ? isExpanded
                    ? `${contentHeight ?? 9999}px`
                    : type === 'FILM' ? '17rem'
                      : type === 'TEXT' ? '17rem'
                        : type === 'IMAGE' ? '13rem'
                          : 'none'
                  : 'none'
              }}
            >
              <div
                ref={contentRef as React.RefObject<HTMLDivElement>}
                className={`text-sm text-gray-500 leading-relaxed rich-content`}
                dangerouslySetInnerHTML={{ __html: renderRichContent(content) }}
              />

              {/* Fade overlay — now anchored to the bottom of the clipped container for perfect alignment */}
              {shouldTruncate && !isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-white via-white/80 to-white/0 pointer-events-none z-10" />
              )}
            </div>

            {shouldTruncate && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Capture current scrollHeight right before expanding
                  if (!isExpanded && contentRef.current) {
                    setContentHeight(contentRef.current.scrollHeight)
                  }
                  setIsExpanded(!isExpanded)
                }}
                className="mt-1 ml-auto block w-fit text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors underline"
              >
                {isExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        )}
        {/* Tags */}
        {tags && (
          <div className="flex items-center gap-2 mb-4">
            <div
              ref={tagsRef}
              style={{
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-out',
                maxHeight: isTagsExpanded ? '1000px' : '28px',
              }}
              className="flex flex-wrap items-center gap-1.5 flex-1"
            >
              {tags.split(',').map((tag, i) => (
                <span key={i} className="text-h4Mob bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">#{tag.trim()}</span>
              ))}
            </div>
            {hasMoreTags && (
              <button
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  setIsTagsExpanded(!isTagsExpanded);
                }}
                className="shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <ChevronDown size={14} className={`transition-transform duration-200 ${isTagsExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        {/* Footer - Actions only */}
        <div className={`mt-auto flex items-center justify-end border-t border-gray-50 pt-4 ${styles.footer}`}>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
