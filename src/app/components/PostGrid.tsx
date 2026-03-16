'use client'

import { Post as PostComponent } from '@/app/components/Post'
import type { Post } from '@/lib/posts'

interface PostGridProps {
  posts: Post[]
}

export function PostGrid({ posts }: PostGridProps) {
  return (
    <div
      className="w-full"
      style={{
        columnCount: 'auto' as never,
        columnWidth: '300px',
        columnGap: '16px',
      }}
    >
      {posts.map((post) => (
        <div
          key={post.id}
          style={{ breakInside: 'avoid', marginBottom: '16px' }}
          className={post.type === 'FILM' ? 'column-span-all md:column-span-none' : ''}
        >
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
