import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/data'
import { PostsProvider, PostsForm, PostsList } from './posts-manager'

async function Dashboard() {
  const user = await currentUser()

  if (!user) {
    redirect('/signin')
  }
  const email = user.emailAddresses[0]?.emailAddress

  if (!email) {
    return <div>Error: No email address found.</div>
  }

  const dbUser = await getOrCreateUser(
    email,
    user.username,
    user.firstName,
    user.lastName,
    user.id,
  )

  if (!dbUser || dbUser.accountType !== 'Admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p>You must be an admin to view this page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-BGpage p-8 font-old-standard-tt">
      <PostsProvider authorId={dbUser.id}>
        <div className="mx-auto max-w-7xl space-y-12">
          <section>
            <PostsForm />
          </section>

          <section className="border-t border-(--color-BGdivider) pt-8">
            <h2 className="mb-6 text-3xl text-(--color-BGnav) font-kingthingsSpikeless">
              Your Posts
            </h2>
            <PostsList />
          </section>
        </div>
      </PostsProvider>
    </div>
  )
}

export default Dashboard
