'use client'

import { RedirectToSignIn, SignedOut } from '@clerk/nextjs'
import React from 'react'

function SignIn() {
  return (
    <SignedOut>
      <RedirectToSignIn redirectUrl={'/'}/>
    </SignedOut>
  )
}

export default SignIn
