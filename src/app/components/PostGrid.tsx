'use client'

import { Post as PostComponent } from '@/app/components/Post'
import type { Post } from '@/lib/posts'
import React, { useLayoutEffect, useRef } from 'react'

interface PostGridProps {
  posts: Post[]
}

export function PostGrid({ posts }: PostGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid || posts.length === 0) return

    const rowHeight = 1
    const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('row-gap'))

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const item = entry.target as HTMLElement
        const rowSpan = Math.ceil((entry.contentRect.height + rowGap) / (rowHeight + rowGap))
        item.style.gridRowEnd = `span ${rowSpan}`
      }
    })

    const items = Array.from(grid.children)
    items.forEach(item => resizeObserver.observe(item as HTMLElement))

    return () => {
      resizeObserver.disconnect()
    }
  }, [posts])

  return (
    <div ref={gridRef} className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 items-start grid-flow-dense" style={{ gridAutoRows: '1px' }}>
      {posts.map((post) => (
        <div key={post.id}
          className={`
        ${post.type === 'FILM' && 'col-span-2'}
        ${post.type === 'TEXT' && 'col-span-1'}
        ${post.type === 'IMAGE' && 'col-span-1'}
        ${(post.type === 'IMAGE' && post.images.length > 1) && 'col-span-1'}
        `}>
          <PostComponent
            type={post.type}
            title={post.title ?? undefined}
            content={post.content ?? undefined}
            images={post.images}
            link={post.link ?? undefined}
            createdAt={post.createdAt}
            rating={post.rating ?? undefined}
            year={post.year ?? undefined}
            filmTitle={post.filmTitle ?? undefined}
            tags={post.tags ?? undefined}
            showDetails={post.showDetails ?? undefined}
          />
        </div>
      ))}
    </div>
  )
}
