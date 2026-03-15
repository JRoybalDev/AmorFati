/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '../generated/prisma'
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
})

async function main() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY

  if (!apiKey) {
    console.error('Error: NEXT_PUBLIC_TMDB_API_KEY is not set in environment variables.')
    process.exit(1)
  }

  console.log('Starting backfill for Film posts...')

  // Find all FILM posts that are missing data
  const posts = await prisma.post.findMany({
    where: {
      type: 'FILM',
      OR: [
        { rating: null } as any,
        { year: null } as any,
        { filmTitle: null } as any,
      ],
    },
  })

  console.log(`Found ${posts.length} posts to update.`)

  for (const post of posts) {
    if (!post.link) {
      console.log(`Skipping post ${post.id}: No link provided.`)
      continue
    }

    // Extract media type and ID from the TMDB link
    // Expected format: https://www.themoviedb.org/movie/12345 or https://www.themoviedb.org/tv/12345
    const match = post.link.match(/(movie|tv)\/(\d+)/)

    if (!match) {
      console.log(`Skipping post ${post.id}: Could not parse TMDB ID from link "${post.link}"`)
      continue
    }

    const [, mediaType, tmdbId] = match

    try {
      // Fetch details from TMDB
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${apiKey}`
      )

      if (!response.ok) {
        console.error(`Failed to fetch TMDB data for ${mediaType}/${tmdbId}: ${response.statusText}`)
        continue
      }

      const data = await response.json()

      const rating = data.vote_average
      const releaseDate = data.release_date || data.first_air_date
      const year = releaseDate ? releaseDate.split('-')[0] : null
      const filmTitle = data.title || data.name

      // Update the post
      await prisma.post.update({
        where: { id: post.id },
        data: {
          rating,
          year,
          filmTitle,
        } as any,
      })

      console.log(`Updated post ${post.id}: "${filmTitle}" (${year}) - Rating: ${rating}`)

      // Add a small delay to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`Error processing post ${post.id}:`, error)
    }
  }

  console.log('Backfill completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
