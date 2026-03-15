import { getPosts } from '@/lib/data'
import { PostGrid } from '@/app/components/PostGrid'
import { PostType } from '@/generated/prisma'

export default async function SweetDispositionPage() {
  const posts = await getPosts(PostType.IMAGE)

  return (
    <div className="min-h-screen bg-BGpage p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <header>
          <h1 className="text-4xl font-medium font-manufacturingConsent text-gray-900">Sweet Disposition</h1>
          <p className="text-gray-500 mt-1">A gallery of moments and aesthetics.</p>
        </header>
        <section>
          <PostGrid posts={posts} />
        </section>
      </div>
    </div>
  )
}
