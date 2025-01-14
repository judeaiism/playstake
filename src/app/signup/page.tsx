'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AvatarCircles from '@/components/magicui/avatar-circles'
import SparklesText from '@/components/magicui/sparkles-text'
import Iphone15Pro from '@/components/magicui/iphone-15-pro'
import AnimatedGridPattern from '@/components/magicui/animated-grid-pattern'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/firebase'

export default function SignUpPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [psnName, setPsnName] = useState('')
  const [age, setAge] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate all fields
    if (!username.trim()) {
      setError('Username is required')
      setIsLoading(false)
      return
    }
    if (!psnName.trim()) {
      setError('PSN Name is required')
      setIsLoading(false)
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      setIsLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters long')
      setIsLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }
    if (age === null) {
      setError('Please confirm your age')
      setIsLoading(false)
      return
    }

    // Proceed with user creation if all validations pass
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        psnName,
        avatarUrl: '/images/default-avatar.jpg', // Set a default avatar URL
        age,
        createdAt: new Date().toISOString(),
      })

      router.push('/dashboard')
    } catch (err) {
      console.error('Registration error:', err)
      if (err instanceof Error) {
        if (err.message.includes('auth/email-already-in-use')) {
          setError('This email is already in use. Please try another one.')
        } else if (err.message.includes('auth/invalid-email')) {
          setError('Invalid email address. Please check and try again.')
        } else if (err.message.includes('auth/weak-password')) {
          setError('Password is too weak. Please use a stronger password.')
        } else {
          setError(`Failed to register: ${err.message}`)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAgeConfirmation = () => {
    setIsAgeConfirmed(!isAgeConfirmed)
    setAge(isAgeConfirmed ? null : 18)
  }

  // Update this array with your actual image paths
  const avatarUrls = [
    '/images/avatar1.jpg',
    '/images/avatar2.jpg',
    '/images/avatar3.jpg',
    '/images/avatar4.jpg', // Add more if needed
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-red-700 flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedGridPattern />
      <div className="relative z-10">
        <Iphone15Pro width={433} height={882} />
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl w-full max-w-[320px] max-h-[750px] overflow-auto">
            <AvatarCircles
              numPeople={488}
              avatarUrls={avatarUrls}
              className="mb-4 justify-center"
            />
            <SparklesText
              text="Sign Up for PLAYSTAKE"
              className="text-2xl font-bold text-center text-purple-900 mb-4"
            />
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <Label htmlFor="psnName">
                  PSN Name <span className="text-xs text-gray-500">(will not be public)</span>
                </Label>
                <Input
                  id="psnName"
                  type="text"
                  value={psnName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPsnName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label>Age Confirmation</Label>
                <Button
                  type="button"
                  onClick={handleAgeConfirmation}
                  variant={isAgeConfirmed ? "default" : "secondary"}
                  className={`mt-1 w-full text-sm transition-all duration-300 ${
                    isAgeConfirmed
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {isAgeConfirmed ? (
                    <>
                      Age Confirmed (18+) <span className="ml-2">✅</span>
                    </>
                  ) : (
                    'Confirm you are 18 or older'
                  )}
                </Button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="medium"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing Up...' : 'Sign Up'}
                </Button>
              </div>
            </form>
            <div className="mt-3 text-center">
              <Link href="/login" className="text-xs text-purple-600 hover:text-purple-500">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}