import './globals.css'
import { PostGrid } from './components/PostGrid';
import { getPosts } from '@/lib/data'

export default async function Home() {
  const posts = await getPosts()

  if (posts.length < 1) return (
    <div className="text-center py-24">
      <p className="text-3xl text-BGpageDark/10 mb-2" style={{ fontFamily: "'Pirata One', serif" }}>
        Nothing here.
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-BGpage p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <PostGrid posts={posts} />
      </div>
    </div>
  );
}
