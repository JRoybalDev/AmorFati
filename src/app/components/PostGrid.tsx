'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Post as PostComponent } from '@/app/components/Post'
import type { Post } from '@/lib/posts'

interface PostGridProps {
  posts: Post[]
}

export function PostGrid({ posts }: PostGridProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="w-full"
      style={{
        columnCount: 'auto' as never,
        columnWidth: '300px',
        columnGap: '16px',
      }}
    >
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          style={{ breakInside: 'avoid', marginBottom: '16px' }}
          className={post.type === 'FILM' ? 'column-span-all md:column-span-none' : ''}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{
            duration: 0.45,
            delay: Math.min(index * 0.035, 0.22),
            ease: [0.22, 1, 0.36, 1],
          }}
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
            isPoetry={post.isPoetry ?? undefined}
            showDetails={post.showDetails ?? undefined}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
