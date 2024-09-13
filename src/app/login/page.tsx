'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
// Remove this line:
// import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // TODO: Implement login logic here
    console.log('Login attempt with:', { email, password })
    // For now, we'll just redirect to the dashboard
    router.push('/dashboard')
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
    setter(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-red-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-purple-900 mb-6">Login to PLAYSTAKE</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, setEmail)}
              required
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