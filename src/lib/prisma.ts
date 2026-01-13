import { PrismaClient } from '@/generated/prisma'

const prismaClientSingleton = () => {
  const accelerateUrl = process.env.DATABASE_URL

  if (!accelerateUrl) {
    throw new Error('DATABASE_URL environment variable is not defined')
  }

  if (!accelerateUrl.startsWith('prisma+postgres://')) {
    throw new Error('DATABASE_URL must be a Prisma Accelerate URL (prisma+postgres://)')
  }

  return new PrismaClient({
    accelerateUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
