import { prisma } from '@/lib/prisma'

export const getOrCreateUser = async (
  email: string,
  username: string | null | undefined,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  userId: string,
) => {

  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new Error('Valid email is required to get or create user')
  }

  let dbUser = await prisma.user.findUnique({
    where: {
      email: email.trim(),
    },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        email: email.trim(),
        username: username ?? userId,
        name: `${firstName ?? ''} ${lastName ?? ''}`.trim(),
      },
    })
  }

  return dbUser
}
