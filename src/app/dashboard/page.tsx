import React from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrCreateUser } from '@/lib/data'

async function Dashboard() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
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
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  )
}

export default Dashboard
