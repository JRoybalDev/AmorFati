import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-2 text-6xl text-(--color-BGnav) font-manufacturingConsent">
        404
      </h1>
      <h2 className="mb-6 text-2xl text-(--color-BGnav) font-manufacturingConsent">
        Page Not Found
      </h2>
      <p className="mb-8 text-lg">
        Could not find requested resource
      </p>
      <Link
        href="/"
        className="rounded bg-(--color-BGbutton) px-6 py-2 text-TEXTmain hover:bg-(--color-HOVERbutton) font-manufacturingConsent transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
