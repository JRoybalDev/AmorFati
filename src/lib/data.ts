import { prisma } from '@/lib/prisma'

export async function getOrCreateUser(
  email: string,
  username: string | null | undefined,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  clerkId: string
) {
  // Check if user already exists
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (user) {
    return user
  }

  // Prepare data for new user
  const name = [firstName, lastName].filter(Boolean).join(' ')
  const fallbackUsername = `${email.split('@')[0]}-${Math.random().toString(36).slice(2, 7)}`

  return await prisma.user.create({
    data: {
      id: clerkId,
      email,
      username: username || fallbackUsername,
      name: name || username || fallbackUsername,
      accountType: 'User',
    },
  })
}
