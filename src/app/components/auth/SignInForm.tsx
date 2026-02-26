'use client'

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import Link from 'next/link'

export default function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      } else {
        // This can happen for scenarios like MFA
        console.log(result)
        setError(
          'Multi-factor authentication is not yet supported in this custom form.',
        )
      }
    } catch (err: unknown) {
      console.error(JSON.stringify(err, null, 2))
      setError(
        (err as { errors?: { longMessage?: string }[] })?.errors?.[0]?.longMessage || 'An error occurred. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div>
        <label
          htmlFor="identifier"
          className="block text-sm font-medium text-gray-700"
        >
          Email or Username
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="mt-1 py-2 px-4 block w-full rounded-md border border-BGbutton shadow-sm focus:border-BGbutton focus:ring-BGbutton sm:text-sm text-gray-700"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 py-2 px-4 block w-full rounded-md border border-BGbutton shadow-sm focus:border-BGbutton focus:ring-BGbutton sm:text-sm text-gray-700"
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 hover:cursor-pointer"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
      <div className="text-center text-sm">
        <span className="text-gray-600">Don&apos;t have an account? </span>
        <Link href="/signup" className="font-medium text-black hover:text-gray-800 underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </form>
  )
}
