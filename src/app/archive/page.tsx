import { getPosts } from '@/lib/data'
import Archive, { Post } from '../components/Archive'
import { PostType } from '@/generated/prisma'

export default async function ArchivePage() {
  const posts = await getPosts() // No type, so all posts

  return (
    <div className="min-h-screen bg-BGpage p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <section>
          <Archive posts={posts as unknown as Post[]} />
        </section>
      </div>
    </div>
  )
}
