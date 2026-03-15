'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-2 text-6xl text-(--color-BGnav) font-manufacturingConsent">
        Error
      </h1>
      <h2 className="mb-6 text-2xl text-(--color-BGnav) font-manufacturingConsent">
        Something went wrong!
      </h2>
      <p className="mb-8 text-lg">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="rounded bg-(--color-BGbutton) px-6 py-2 text-TEXTmain hover:bg-(--color-HOVERbutton) font-manufacturingConsent transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded bg-(--color-BGdivider) px-6 py-2 text-TEXTmain hover:bg-(--color-BGnav) font-manufacturingConsent transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
