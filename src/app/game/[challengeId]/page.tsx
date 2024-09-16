'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Clock, Trophy } from 'lucide-react'
import Confetti from 'react-confetti'

export default function GamePage({ params }: { params: { challengeId: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [challenge, setChallenge] = useState<any>(null)
  const [opponent, setOpponent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEnding, setIsEnding] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3)
  const [showInstructions, setShowInstructions] = useState(false)
  const [matchTime, setMatchTime] = useState(0)
  const [scores, setScores] = useState({ challenger: 0, opponent: 0 })
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    const fetchChallengeData = async () => {
      const challengeRef = doc(db, 'challenges', params.challengeId)
      const unsubscribe = onSnapshot(challengeRef, (doc) => {
        if (doc.exists()) {
          const challengeData = doc.data()
          setChallenge(challengeData)
          setScores({
            challenger: challengeData.challengerScore || 0,
            opponent: challengeData.opponentScore || 0
          })
          // Fetch opponent data
          const opponentId = challengeData.challengerId === user.uid ? challengeData.opponentId : challengeData.challengerId
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
      setLoading(false)
    }

    fetchChallengeData()
  }, [user, authLoading, router, params.challengeId])

  useEffect(() => {
    const timer = setInterval(() => {
      setMatchTime(prevTime => prevTime + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isEnding && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (isEnding && timeLeft === 0) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
      handleMatchEnd()
    }
  }, [isEnding, timeLeft])

  const handleMatchEnd = async () => {
    const challengeRef = doc(db, 'challenges', params.challengeId)
    await updateDoc(challengeRef, {
      status: 'completed',
      challengerScore: scores.challenger,
      opponentScore: scores.opponent,
      endTime: new Date()
    })
    router.push('/dashboard')
  }

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const incrementScore = async (player: 'challenger' | 'opponent') => {
    const newScores = {
      ...scores,
      [player]: scores[player] + 1
    }
    setScores(newScores)
    const challengeRef = doc(db, 'challenges', params.challengeId)
    await updateDoc(challengeRef, {
      [`${player}Score`]: newScores[player]
    })
  }

  if (authLoading || loading) {
    return <div>Loading...</div>
  }

  if (!challenge || !opponent || !user) {
    return <div>Challenge not found or user not authenticated</div>
  }

  const isChallenger = user.uid === challenge.challengerId

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      {showConfetti && <Confetti />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white bg-opacity-40 backdrop-blur-md shadow-lg"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"
          >
            GAMEMATCH
          </motion.h1>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Match in Progress</h2>
        <div className="flex justify-between items-center mb-8">
          <PlayerAvatar
            name={challenge.challengerName}
            score={scores.challenger}
            onScoreIncrement={() => incrementScore('challenger')}
            isCurrentUser={isChallenger}
          />
          <div className="text-4xl font-bold text-gray-800">VS</div>
          <PlayerAvatar
            name={challenge.opponentName}
            score={scores.opponent}
            onScoreIncrement={() => incrementScore('opponent')}
            isCurrentUser={!isChallenger}
          />
        </div>
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 mb-2">Bet Amount</p>
          <p className="text-3xl font-semibold text-gray-800">${challenge.betAmount}</p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="text-lg">{formatTime(matchTime)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Trophy className="w-5 h-5 mr-2" />
            <span className="text-lg">
              {scores.challenger} - {scores.opponent}
            </span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEnding(true)}
          disabled={isEnding}
          className={`w-full py-3 rounded-full text-white font-semibold transition-colors ${
            isEnding ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isEnding ? `Ending in ${timeLeft}...` : 'End Match'}
        </motion.button>
        
        <div className="mt-8">
          <button
            onClick={toggleInstructions}
            className="flex items-center justify-center w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Info className="w-5 h-5 mr-2" />
            Match Instructions
          </button>
          <AnimatePresence>
            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-700"
              >
                <h3 className="font-semibold mb-2">How to Play:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Both players agree on the bet amount.</li>
                  <li>The game begins when both players are ready.</li>
                  <li>Play your best and follow the game rules.</li>
                  <li>Click on your avatar to increment your score.</li>
                  <li>The winner takes the bet amount.</li>
                  <li>Click "End Match" when the game is over.</li>
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function PlayerAvatar({ name, score, onScoreIncrement, isCurrentUser }: { name: string; score: number; onScoreIncrement: () => void; isCurrentUser: boolean }) {
  return (
    <div className="text-center">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={isCurrentUser ? onScoreIncrement : undefined}
        className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-2 ${isCurrentUser ? 'cursor-pointer' : ''}`}
      >
        {name[0].toUpperCase()}
      </motion.div>
      <p className="text-gray-800 font-medium">{name}</p>
      <p className="text-gray-600">Score: {score}</p>
    </div>
  )
}
