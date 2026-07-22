'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <Card className="w-full max-w-md border-border-default bg-bg-default animate-scale-in">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <span className="text-lg font-bold text-white">D</span>
        </div>
        <CardTitle className="text-2xl text-content-emphasis">Create your account</CardTitle>
        <CardDescription className="text-content-subtle">
          Start building your affiliate program
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          <Globe className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-content-subtle">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
