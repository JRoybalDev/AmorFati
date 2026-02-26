import { defineConfig } from '@prisma/config'
import 'dotenv/config'

const accelerateUrl = process.env.DATABASE_URL;

if (!accelerateUrl) {
  throw new Error('DATABASE_URL environment variable is not defined')
}


if (!accelerateUrl.startsWith('prisma+postgres://')) {
  throw new Error('DATABASE_URL must be a Prisma Accelerate URL (prisma+postgres://)')
}

export default defineConfig({
  datasource: {
    url: accelerateUrl,
  },
})
