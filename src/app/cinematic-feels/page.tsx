import { getPosts } from '@/lib/data'
import { PostGrid } from '@/app/components/PostGrid'
import { PostType } from '@/generated/prisma'
import { Suspense } from 'react'
import GlobalLoader from '@/app/components/GlobalLoader'

async function CinematicFeelsPosts() {
  const posts = await getPosts(PostType.FILM)

  if (posts.length < 1) return (
    <div className="text-center py-24">
      <p className="text-3xl text-BGpageDark/10 mb-2" style={{ fontFamily: "'Pirata One', serif" }}>
        Nothing here.
      </p>
    </div>
  )

  return <PostGrid posts={posts} />
}

export default async function CinematicFeelsPage() {
  return (
    <div className="min-h-screen my-8 bg-BGpage p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <header>
          <h1 className="text-4xl font-medium font-manufacturingConsent text-gray-900">Cinematic Feels</h1>
          <p className="text-gray-500 mt-1">Reviews and thoughts on films.</p>
        </header>
        <section>
          <Suspense fallback={<GlobalLoader />}>
            <CinematicFeelsPosts />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
