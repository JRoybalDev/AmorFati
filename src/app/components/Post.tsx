'use client'

import Image from 'next/image'
import React, { useState, useRef, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface PostProps {
  type: 'TEXT' | 'IMAGE' | 'FILM'
  title?: string
  content?: string
  imageUrl?: string
  link?: string
  images?: string[]
  createdAt?: string | Date
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
  children,
}: PostProps) {
  const [showUp, setShowUp] = useState(false)
  const [showDown, setShowDown] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const displayImages = images && images.length > 0 ? images : (imageUrl ? [imageUrl] : [])
  const isMulti = displayImages.length > 2

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    setShowUp(scrollTop > 0)
    setShowDown(scrollTop + clientHeight < scrollHeight - 1)
  }

  useEffect(() => {
    if (isMulti) {
      handleScroll()
    }
  }, [isMulti, displayImages])

  const scroll = (direction: 'up' | 'down') => {
    if (!scrollRef.current) return
    const { clientHeight } = scrollRef.current
    const amount = clientHeight * 0.7
    scrollRef.current.scrollBy({
      top: direction === 'up' ? -amount : amount,
      behavior: 'smooth'
    })
  }

  return (
    <div className="rounded border border-(--color-BGdivider) bg-BGpage p-4 shadow-sm h-fit flex flex-col text-black">
      {type === "FILM" &&
        <div>
          {title && <h3 className="font-bold mb-2">{title}</h3>}
          <Image
            src={imageUrl || ""}
            width={500}
            height={500}
            alt={title || ""}
            className="w-full h-auto object-cover rounded"
          />
          {content && <p>{content}</p>}
        </div>
      }

      {type === "IMAGE" && (
        <div className="relative group">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={`flex flex-col gap-2 ${isMulti ? 'overflow-y-auto h-[500px]' : ''}`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {displayImages.map((img, idx) => (
              <div key={idx} className="w-full">
                <Image
                  src={img}
                  width={500}
                  height={500}
                  alt={title || `Image ${idx + 1}`}
                  className="w-full h-auto object-cover rounded"
                />
              </div>
            ))}
          </div>

          {isMulti && showUp && (
            <button
              onClick={(e) => { e.preventDefault(); scroll('up') }}
              className="absolute top-0 left-0 w-full h-12 bg-linear-to-b from-black/50 to-transparent flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-t"
            >
              <ChevronUp />
            </button>
          )}

          {isMulti && showDown && (
            <button
              onClick={(e) => { e.preventDefault(); scroll('down') }}
              className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-black/50 to-transparent flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-b"
            >
              <ChevronDown />
            </button>
          )}
        </div>
      )}

      {type === "TEXT" &&
        <div>
          {title && <h3 className="font-bold mb-2">{title}</h3>}
          {content && <p>{content}</p>}
        </div>
      }

      {children && <div className="mt-auto pt-2 flex gap-2">{children}</div>}
    </div>
  )
}
