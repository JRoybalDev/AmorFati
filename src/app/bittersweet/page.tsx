import { getPosts } from '@/lib/data'
import { PostGrid } from '@/app/components/PostGrid'
import { PostType } from '@/generated/prisma'
import { Suspense } from 'react'
import GlobalLoader from '@/app/components/GlobalLoader'

async function BittersweetPosts() {
  const allTextPosts = await getPosts(PostType.TEXT)
  const posts = allTextPosts.filter(post => post.isPoetry === true)
  return <PostGrid posts={posts} />
}

export default async function DearDiaryPage() {
  return (
    <div className="min-h-screen my-8 bg-BGpage p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <header>
          <h1 className="text-4xl font-medium font-manufacturingConsent text-gray-900">Bittersweet</h1>
          <p className="text-gray-500 mt-1">A collection of poetry.</p>
        </header>
        <section>
          <Suspense fallback={<GlobalLoader />}>
            <BittersweetPosts />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
