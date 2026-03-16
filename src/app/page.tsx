import './globals.css'
import { PostGrid } from './components/PostGrid';
import { getPosts } from '@/lib/data'

export default async function Home() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen  bg-BGpage p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <PostGrid posts={posts} />
      </div>
    </div>
  );
}
