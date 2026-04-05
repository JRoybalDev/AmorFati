import { getPosts } from '@/lib/data'
import Archive, { Post } from '../components/Archive'
import { Suspense } from 'react'
import GlobalLoader from '@/app/components/GlobalLoader'

async function ArchiveContent() {
  const posts = await getPosts() // No type, so all posts

  if (posts.length < 1) return (
    <div className="text-center py-24">
      <p className="text-3xl text-BGpageDark/10 mb-2" style={{ fontFamily: "'Pirata One', serif" }}>
        Nothing here.
      </p>
    </div>
  )

  return <Archive posts={posts as unknown as Post[]} />
}

export default async function ArchivePage() {
  return (
    <div className="min-h-screen bg-BGpage p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <section>
          <Suspense fallback={<GlobalLoader />}>
            <ArchiveContent />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
