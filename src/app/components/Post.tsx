// src/components/Post.tsx
import React from 'react'

export interface PostProps {
  type: 'TEXT' | 'IMAGE' | 'FILM'
  title?: string
  content?: string
  imageUrl?: string
  link?: string
  createdAt?: string | Date
  children?: React.ReactNode
}

export function Post({
  type,
  title,
  content,
  imageUrl,
  link,
  createdAt,
  children,
}: PostProps) {
  return (
    <div className="rounded border border-(--color-BGdivider) bg-BGpage p-4 shadow transition hover:shadow-md font-old-standard-tt">
      <div className="mb-2 flex items-start justify-between">
        {type !== 'IMAGE' ? (
          <div className="flex flex-col gap-1">
            <span className="w-fit rounded bg-(--color-BGdivider) px-2 py-1 text-xs font-semibold text-TEXTmain">
              {type}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(createdAt || new Date()).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <div></div>
        )}
        {children && <div className="flex gap-2">{children}</div>}
      </div>

      {type === 'TEXT' && (
        <>
          {title && <h4 className="mb-2 text-lg font-bold">{title}</h4>}
          {content && (
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {content}
            </p>
          )}
        </>
      )}

      {type === 'IMAGE' && imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Post image"
          className="w-full rounded object-cover"
        />
      )}

      {type === 'FILM' && (
        <>
          {title && <h4 className="mb-2 text-lg font-bold">{title}</h4>}
          <div className="flex gap-4">
            {imageUrl && (
              <a
                href={link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={title || 'Poster'}
                  className="w-24 rounded object-cover hover:opacity-90"
                />
              </a>
            )}
            {content && (
              <p className="whitespace-pre-wrap text-sm text-gray-700">
                {content}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
