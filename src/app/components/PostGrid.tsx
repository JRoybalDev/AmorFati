'use client'

import { Post as PostComponent } from '@/app/components/Post'
import type { Post } from '@/lib/posts'

interface PostGridProps {
  posts: Post[]
}

export function PostGrid({ posts }: PostGridProps) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start grid-flow-dense">
      {posts.map((post) => (
        <div key={post.id}
          className={`h-full
        ${post.type === 'FILM' && 'md:col-span-2'}
        ${post.type === 'TEXT' && 'md:col-span-1'}
        ${post.type === 'IMAGE' && 'md:col-span-1'}
        ${(post.type === 'IMAGE' && post.images.length > 1) && 'md:col-span-2'}
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
