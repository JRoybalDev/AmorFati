import { getPosts } from '@/lib/data'
import { PostGrid } from '@/app/components/PostGrid'
import { PostType } from '@/generated/prisma'

export default async function DearDiaryPage() {
  const posts = await getPosts(PostType.TEXT)

  return (
    <div className="min-h-screen my-8 bg-BGpage p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <header>
          <h1 className="text-4xl font-medium font-manufacturingConsent text-gray-900">Dear Diary</h1>
          <p className="text-gray-500 mt-1">A collection of thoughts and musings.</p>
        </header>
        <section>
          <PostGrid posts={posts} />
        </section>
      </div>
    </div>
  )
}
