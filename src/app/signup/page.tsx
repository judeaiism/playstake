'use client'

import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AvatarCircles from '@/components/magicui/avatar-circles'
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button'
import SparklesText from '@/components/magicui/sparkles-text'
import Iphone15Pro from '@/components/magicui/iphone-15-pro'

export default function SignUpPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [psnName, setPsnName] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [age, setAge] = useState<number | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (age === null) {
      setError('Please confirm your age')
      return
    }

    try {
      // TODO: Implement registration logic here
      console.log('Registration attempt with:', { username, email, password, psnName, avatar, age })
      // Redirect to the dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Failed to register. Please try again.')
    }
  }

  const handleAvatarUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-red-700 flex items-center justify-center p-4">
      <div className="relative">
        <Iphone15Pro width={433} height={882} />
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md" style={{ maxWidth: '90%', maxHeight: '90%', overflow: 'auto' }}>
            <AvatarCircles
              numPeople={488}  // Adjust this number as needed
              avatarUrls={avatarUrls}
              className="mb-6 justify-center"
            />
            <SparklesText
              text="Sign Up for PLAYSTAKE"
              className="text-3xl font-bold text-center text-purple-900 mb-6"
            />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-2">
                  {avatar ? (
                    <Image src={avatar} alt="Profile" width={128} height={128} className="object-cover" />
                  ) : (
                    <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm"
                >
                  Upload Avatar
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  required
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
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Sign Up
                </Button>
              </div>
            </form>
            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-purple-600 hover:text-purple-500">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}