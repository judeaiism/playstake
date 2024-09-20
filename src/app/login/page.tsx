'use client'

import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import GridPattern from '@/components/magicui/grid-pattern'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/firebase'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // Successful login, redirection will be handled by the useEffect hook
    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to log in. Please check your credentials.')
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    setter(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-red-700 flex items-center justify-center p-4 relative overflow-hidden">
      <GridPattern
        width={40}
        height={40}
        className="absolute inset-0 opacity-20"
        squares={[
          [1, 2],
          [3, 4],
          [5, 6],
        ]}
      />
      <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md relative z-10">
        <h1 className="text-3xl font-bold text-center text-purple-900 mb-6">Login to PLAYSTAKE</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, setEmail)}
              required
              autoComplete="username"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, setPassword)}
              required
              autoComplete="current-password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 p-2"
            />
          </div>
          <Button type="submit" className="w-full bg-yellow-500 text-purple-900 hover:bg-yellow-400">
            Log In
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/signup" className="text-sm text-purple-600 hover:text-purple-500">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}