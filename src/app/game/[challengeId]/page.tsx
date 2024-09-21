'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, onSnapshot, updateDoc, DocumentReference, Firestore, collection, increment, addDoc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Clock, Trophy, AlertTriangle, PlusCircle, MinusCircle } from 'lucide-react'
import Confetti from 'react-confetti'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { FirebaseError } from 'firebase/app'
import { useFirestore } from '@/hooks/useFirestore'

export default function GamePage({ params }: { params: { challengeId: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [challenge, setChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnding, setIsEnding] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3)
  const [showInstructions, setShowInstructions] = useState(false)
  const [matchTime, setMatchTime] = useState(0)
  const [scores, setScores] = useState({ challenger: 0, opponent: 0 })
  const [showConfetti, setShowConfetti] = useState(false)
  const [challengerData, setChallengerData] = useState<any>(null)
  const [opponentData, setOpponentData] = useState<any>(null)
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [selectedWinner, setSelectedWinner] = useState<'challenger' | 'opponent' | 'draw' | null>(null)
  const { updateDocument, addDocument, incrementField } = useFirestore()

  useEffect(() => {
    console.log('Auth loading:', authLoading)
    console.log('User:', user)

    if (authLoading) return

    if (!user) {
      console.log('No user, redirecting to login')
      router.push('/login')
      return
    }

    const fetchChallengeData = async () => {
      console.log('Fetching challenge data for ID:', params.challengeId)
      try {
        const challengeRef = doc(db as Firestore, 'challenges', params.challengeId)
        const unsubscribe = onSnapshot(challengeRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const challengeData = docSnapshot.data()
            console.log('Challenge data:', challengeData)
            setChallenge(challengeData)
            setScores({
              challenger: challengeData.challengerScore || 0,
              opponent: challengeData.opponentScore || 0
            })
            
            // Fetch challenger and opponent data
            const challengerRef = doc(db as Firestore, 'users', challengeData.challengerId)
            const opponentRef = doc(db as Firestore, 'users', challengeData.opponentId)
            
            const [challengerSnap, opponentSnap] = await Promise.all([
              getDoc(challengerRef),
              getDoc(opponentRef)
            ])

            if (challengerSnap.exists() && opponentSnap.exists()) {
              console.log('Challenger data:', challengerSnap.data())
              console.log('Opponent data:', opponentSnap.data())
              setChallengerData(challengerSnap.data())
              setOpponentData(opponentSnap.data())
            } else {
              console.error('Challenger or opponent data not found')
              setError('Player data not found')
            }
          } else {
            console.error('Challenge not found')
            setError('Challenge not found')
            router.push('/dashboard')
          }
          setLoading(false)
        })

        return () => unsubscribe()
      } catch (err) {
        console.error('Error fetching challenge data:', err)
        setError('Error fetching challenge data')
        setLoading(false)
      }
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
    if (!user || !challengerData || !opponentData) {
      console.error('Missing user or player data')
      toast.error('Unable to end match due to missing data')
      return
    }

    try {
      const matchResult = {
        status: 'completed',
        challengerScore: scores.challenger,
        opponentScore: scores.opponent,
        endTime: new Date().toISOString(),
        winner: selectedWinner,
        betAmount: challenge.betAmount || 0,
        duration: matchTime,
        challengerId: challenge.challengerId,
        opponentId: challenge.opponentId,
        challengerUsername: challengerData.username,
        opponentUsername: opponentData.username,
        game: challenge.game || 'Unknown Game'
      }

      console.log('Updating challenge document:', params.challengeId, matchResult)
      await updateDocument('challenges', params.challengeId, matchResult)

      console.log('Adding match result to matchResults collection')
      await addDocument('matchResults', matchResult)

      if (selectedWinner !== 'draw' && challenge.betAmount) {
        const winnerId = selectedWinner === 'challenger' ? challenge.challengerId : challenge.opponentId
        const loserId = selectedWinner === 'challenger' ? challenge.opponentId : challenge.challengerId

        console.log('Updating winner balance:', winnerId, challenge.betAmount)
        await incrementField('users', winnerId, 'balance', challenge.betAmount)

        console.log('Updating loser balance:', loserId, -challenge.betAmount)
        await incrementField('users', loserId, 'balance', -challenge.betAmount)
      }

      const newMatch = {
        challenger: {
          username: challengerData.username,
          avatarUrl: challengerData.avatarUrl || null
        },
        opponent: {
          username: opponentData.username,
          avatarUrl: opponentData.avatarUrl || null
        },
        game: challenge.game || 'Unknown Game',
        timestamp: new Date().toISOString(),
        winner: selectedWinner
      }

      console.log('Updating challenger recent matches:', challenge.challengerId)
      await updateDocument('users', challenge.challengerId, {
        recentMatches: arrayUnion(newMatch)
      })

      console.log('Updating opponent recent matches:', challenge.opponentId)
      await updateDocument('users', challenge.opponentId, {
        recentMatches: arrayUnion(newMatch)
      })

      toast.success('Match ended successfully')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error ending match:', error)
      if (error instanceof FirebaseError) {
        console.error('Firebase error code:', error.code)
        console.error('Firebase error message:', error.message)
      }
      toast.error(`Failed to end match: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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

  const decrementScore = async (player: 'challenger' | 'opponent') => {
    if (scores[player] > 0) {
      const newScores = {
        ...scores,
        [player]: scores[player] - 1
      }
      setScores(newScores)
      const challengeRef = doc(db, 'challenges', params.challengeId)
      await updateDoc(challengeRef, {
        [`${player}Score`]: newScores[player]
      })
    }
  }

  const handleWinnerSelection = (winner: 'challenger' | 'opponent' | 'draw') => {
    setSelectedWinner(winner)
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">Error: {error}</div>
  }

  if (!challenge || !user || !challengerData || !opponentData) {
    return <div className="flex items-center justify-center min-h-screen">
      Challenge or user data not fully loaded. Please try again.
    </div>
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
            PLAY$$TAKES$
          </motion.h1>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Match in Progress</h2>
        <div className="flex justify-between items-center mb-8">
          <PlayerAvatar
            name={challengerData?.username || 'Challenger'}
            psnName={challengerData?.psnName || 'N/A'}
            avatarUrl={challengerData?.avatarUrl}
            score={scores.challenger}
            onScoreIncrement={() => incrementScore('challenger')}
            onScoreDecrement={() => decrementScore('challenger')}
            isCurrentUser={isChallenger}
          />
          <div className="text-4xl font-bold text-gray-800">VS</div>
          <PlayerAvatar
            name={opponentData?.username || 'Opponent'}
            psnName={opponentData?.psnName || 'N/A'}
            avatarUrl={opponentData?.avatarUrl}
            score={scores.opponent}
            onScoreIncrement={() => incrementScore('opponent')}
            onScoreDecrement={() => decrementScore('opponent')}
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

        <div className="mt-8 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Select Match Result:</h3>
          <div className="flex justify-between">
            <button
              onClick={() => handleWinnerSelection('challenger')}
              className={`px-4 py-2 rounded-full ${
                selectedWinner === 'challenger'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {challengerData?.username} Wins
            </button>
            <button
              onClick={() => handleWinnerSelection('draw')}
              className={`px-4 py-2 rounded-full ${
                selectedWinner === 'draw'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Draw
            </button>
            <button
              onClick={() => handleWinnerSelection('opponent')}
              className={`px-4 py-2 rounded-full ${
                selectedWinner === 'opponent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {opponentData?.username} Wins
            </button>
          </div>
        </div>

        <div className="mb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center p-2 bg-red-100 border border-red-400 text-red-700 rounded"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p className="text-sm">
              <strong className="font-bold">Warning:</strong> Lying twice about game results will result in a ban.
            </p>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEnding(true)}
          disabled={isEnding || !selectedWinner}
          className={`w-full py-3 rounded-full text-white font-semibold transition-colors ${
            isEnding || !selectedWinner ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isEnding ? `Ending in ${timeLeft}...` : selectedWinner ? 'End Match' : 'Select Match Result to End Match'}
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
                  <li>Search & Add your opponent on PSN.</li>
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

function PlayerAvatar({ name, psnName, avatarUrl, score, onScoreIncrement, onScoreDecrement, isCurrentUser }: { 
  name: string; 
  psnName: string;
  avatarUrl?: string;
  score: number; 
  onScoreIncrement: () => void;
  onScoreDecrement: () => void;
  isCurrentUser: boolean 
}) {
  return (
    <div className="text-center">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-2 overflow-hidden`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            priority={true}
          />
        ) : (
          name[0].toUpperCase()
        )}
      </motion.div>
      <p className="text-gray-800 font-medium">{name}</p>
      <p className="text-gray-600 text-sm">PSN: {psnName}</p>
      <p className="text-gray-600">Score: {score}</p>
      {isCurrentUser && (
        <div className="flex justify-center space-x-2 mt-2">
          <button onClick={onScoreDecrement} className="p-1 bg-red-500 text-white rounded-full">
            <MinusCircle size={16} />
          </button>
          <button onClick={onScoreIncrement} className="p-1 bg-green-500 text-white rounded-full">
            <PlusCircle size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
