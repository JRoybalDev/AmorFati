import { getPosts } from '@/lib/data'
import { PostGrid } from '@/app/components/PostGrid'

export default async function ArchivePage() {
  const posts = await getPosts() // No type, so all posts

  return (
    <div className="min-h-screen my-16 bg-BGpage p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <header>
          <h1 className="text-4xl font-medium font-manufacturingConsent text-gray-900">Archive</h1>
          <p className="text-gray-500 mt-1">All posts from the beginning of time.</p>
        </header>
        <section>
          <PostGrid posts={posts} />
        </section>
      </div>
    </div>
  )
}
