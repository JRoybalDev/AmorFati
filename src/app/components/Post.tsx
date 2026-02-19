'use client'

import React, { useState } from 'react'
import { Image as ImageIcon, Film, Type, ChevronLeft, ChevronRight, Star } from 'lucide-react'

export interface PostProps {
  type: 'TEXT' | 'IMAGE' | 'FILM'
  title?: string
  content?: string
  imageUrl?: string
  link?: string
  images?: string[]
  createdAt?: string | Date
  rating?: number
  year?: string | number
  filmTitle?: string
  children?: React.ReactNode
}

export function Post({
  type,
  title,
  content,
  imageUrl,
  images,
  link,
  createdAt,
  rating,
  year,
  filmTitle,
  children,
}: PostProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const displayImages = images && images.length > 0 ? images : (imageUrl ? [imageUrl] : [])

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (displayImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length)
    }
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (displayImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)
    }
  }

  const currentImage = displayImages[currentImageIndex]

  const typeLabel = type === 'IMAGE' ? 'Gallery' : (type === 'FILM' ? 'Film' : 'Text')
  const typeIcon = type === 'IMAGE' ? <ImageIcon size={14} /> : (type === 'FILM' ? <Film size={14} /> : <Type size={14} />)

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

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md border border-gray-100 ${type === 'FILM' ? 'block' : 'flex flex-col'}`}>
      {/* Image Section */}
      {currentImage && type !== 'TEXT' ? (
        <div className={`relative bg-gray-100 group/image ${type === 'FILM' ? 'float-left w-2/5 aspect-9/16 mr-5 mb-2 ' : 'w-full h-[350px]'}`}>
          {type === 'FILM' && link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative ">
              <img
                src={currentImage}
                alt={title || "Post image"}
                className="w-full block h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <h3 className="text-lg font-bold leading-tight shadow-black drop-shadow-md">{filmTitle}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs font-medium text-white/90">
                  {rating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={12} fill="currentColor" />
                      <span>{rating}</span>
                    </div>
                  )}
                  {year && <span>{year}</span>}
                </div>
              </div>
            </a>
          ) : (
            <>
              <img
                src={currentImage}
                alt={title || "Post image"}
                className={`w-full block ${type === 'FILM' ? 'h-full object-cover ' : 'h-full object-contain'}`}
              />
              {/* Gallery Arrows */}
              {type === 'IMAGE' && displayImages.length > 1 && (
                <>
                  <button
                      onClick={handlePrevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <ChevronRight size={16} />
                    </button>
                    {/* Dots indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {displayImages.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                {/* Film Overlay */}
                {type === 'FILM' && (
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <h3 className="text-lg font-bold leading-tight shadow-black drop-shadow-md">{filmTitle}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs font-medium text-white/90">
                      {rating && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star size={12} fill="currentColor" />
                          <span>{rating}</span>
                        </div>
                      )}
                      {year && <span>{year}</span>}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      ) : null}

      {/* Content Section */}
      <div className={`p-5 ${type === 'FILM' ? '' : 'flex flex-1 flex-col'}`}>
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {/* Text label moved here */}
          <span className="text-gray-500">{typeLabel}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
          <span>{timeAgo(createdAt)}</span>
        </div>

        {/* Title */}
        {title && (
          <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
            {title}
          </h3>
        )}

        {content && (
          <p className="mb-4 text-sm text-gray-500 leading-relaxed flex-1">
            {content}
          </p>
        )}

        {/* Footer - Actions only */}
        <div className={`mt-auto flex items-center justify-end border-t border-gray-50 pt-4 ${type === 'FILM' ? 'clear-both' : ''}`}>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
