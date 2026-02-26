'use client'

import { SignUp } from '@clerk/nextjs'
import React, { useState } from 'react'

export default function SignUpForm() {
  const [code, setCode] = useState('')
  const [isAllowed, setIsAllowed] = useState(false)

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === process.env.NEXT_PUBLIC_SIGNUP_CODE) {
      setIsAllowed(true)
    } else {
      alert('Invalid access code')
    }
  }

  if (!isAllowed) {
    return (
      <form onSubmit={handleCodeSubmit} className="space-y-6 w-full max-w-sm mx-auto">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Access Code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 py-2 px-4 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm text-gray-700"
            placeholder="Enter access code to sign up"
          />
        </div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Continue
        </button>
      </form>
    )
  }

  return (
    <div className="flex justify-center">
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/signin"
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-black hover:bg-gray-800 text-white text-sm normal-case',
            card: 'shadow-none border border-gray-200 rounded-xl',
            headerTitle: 'text-gray-900',
            headerSubtitle: 'text-gray-500',
            socialButtonsBlockButton: 'text-gray-600 border-gray-200 hover:bg-gray-50',
            formFieldInput: 'border-gray-300 focus:ring-black focus:border-black',
            footerActionLink: 'text-black hover:text-gray-800'
          }
        }}
      />
    </div>
  )
}
