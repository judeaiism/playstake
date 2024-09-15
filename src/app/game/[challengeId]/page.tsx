'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export default function GamePage({ params }: { params: { challengeId: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [challenge, setChallenge] = useState<any>(null)
  const [opponent, setOpponent] = useState<any>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchChallengeData = async () => {
      const challengeRef = doc(db, 'challenges', params.challengeId)
      const unsubscribe = onSnapshot(challengeRef, (doc) => {
        if (doc.exists()) {
          setChallenge(doc.data())
          // Fetch opponent data
          const opponentId = doc.data().challengerId === user.uid ? doc.data().opponentId : doc.data().challengerId
          fetchOpponentData(opponentId)
        } else {
          // Handle case where challenge doesn't exist
          router.push('/dashboard')
        }
      })

      return () => unsubscribe()
    }

    const fetchOpponentData = async (opponentId: string) => {
      const opponentRef = doc(db, 'users', opponentId)
      const opponentSnap = await getDoc(opponentRef)
      if (opponentSnap.exists()) {
        setOpponent(opponentSnap.data())
      }
    }

    fetchChallengeData()
  }, [user, router, params.challengeId])

  const handleMatchEnd = async () => {
    // Implement match end logic here
    // Update challenge status in Firebase
    // Redirect users back to dashboard
  }

  if (!challenge || !opponent) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Match in Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-2" />
              <p>{challenge.challengerName}</p>
            </div>
            <div className="text-4xl font-bold">VS</div>
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-2" />
              <p>{challenge.opponentName}</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="mb-4">Bet Amount: ${challenge.betAmount}</p>
            <Button onClick={handleMatchEnd}>End Match</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
