'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc, setDoc, updateDoc, DocumentData, collection, getDocs, query, where, onSnapshot, addDoc, or, Query, QuerySnapshot, arrayUnion, orderBy, increment } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase/firebase'
import { Progress } from "@/components/ui/progress"
import BoxReveal from "@/components/magicui/box-reveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award, Gamepad, ChevronRight, DollarSign, PlusCircle, MinusCircle, Search, Percent, User as UserIcon, Settings, LogOut, BellIcon, CheckIcon, CheckCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import ShinyButton from "@/components/magicui/shiny-button"
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AnimatedSubscribeButton } from "@/components/magicui/animated-subscribe-button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import Link from 'next/link'
import SparklesText from "@/components/magicui/sparkles-text"
import Image from 'next/image'
import { ChallengeModal } from '@/components/challenge-modal'
import { signOut } from '@/lib/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { toast } from 'react-hot-toast'
import { User } from '@/types/user';
import { useBalance } from '@/hooks/useBalance';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AnimatedList } from "@/components/magicui/animated-list"
import { TvIcon } from 'lucide-react'
import { Loader2 } from "lucide-react" // Import a loading icon

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  psnName: z.string().min(3, {
    message: "PSN Name must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

// Define the Match type
type Match = {
  challenger: {
    username: string;
    avatarUrl?: string;
  };
  opponent: {
    username: string;
    avatarUrl?: string;
  };
  game: string;
  timestamp: string;
  winner: string; // 'challenger', 'opponent', or 'draw'
};

// Define the UserData type
type UserData = {
  id: string;
  username: string;
  psnName: string;
  email: string;
  recentMatches: Match[];
  totalMatches: number;
  winRate: number;
  rank: number;
  avatarUrl?: string;
  createdAt: string;
  // Add other necessary properties if needed
}

// Add this simple loading component
const LoadingComponent = () => (
  <div className="flex justify-center items-center h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
  </div>
)

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  const [flashWin, setFlashWin] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [betOption, setBetOption] = useState("online")
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState("https://github.com/shadcn.png")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState(false)
  const [allUsers, setAllUsers] = useState<Array<{id: string, username: string, avatarUrl?: string, isOnline: boolean}>>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [challengeModalOpen, setChallengeModalOpen] = useState(false)
  const [selectedOpponent, setSelectedOpponent] = useState<{
    id: string;
    username: string;
    avatarUrl?: string;
  } | null>(null)
  const [activeChallenge, setActiveChallenge] = useState<string | null>(null)
  const [matchStarted, setMatchStarted] = useState(false)
  const [challenges, setChallenges] = useState<Array<{
    id: string;
    challengerName: string;
    betAmount: number;
    status: string;
  }>>([])
  const [isAccepting, setIsAccepting] = useState(false)
  const [acceptProgress, setAcceptProgress] = useState(0)
  const [recentMatches, setRecentMatches] = useState<Array<{
    challenger: {
      username: string;
      avatarUrl?: string;
    };
    opponent: {
      username: string;
      avatarUrl?: string;
    };
    game: string;
    timestamp: string;
    winner: string;
  }>>([])
  const [notifications, setNotifications] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const { balance } = useBalance(user?.uid);

  const [totalMatches, setTotalMatches] = useState(0)
  const [winRate, setWinRate] = useState(0)
  const [rank, setRank] = useState(0)

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      psnName: "",
      email: "",
    },
  })

  useEffect(() => {
    console.log('Dashboard component mounted')
    console.log('Auth loading:', authLoading)
    console.log('User:', user)

    if (authLoading) return;

    if (!user) {
      console.log('No user, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('Setting up challenge listeners for user:', user.uid);

    const challengesQuery = query(
      collection(db, 'challenges'),
      where('status', 'in', ['pending', 'accepted']),
      where('challengerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(challengesQuery, (snapshot) => {
      console.log('Challenges snapshot received');
      snapshot.docChanges().forEach((change) => {
        const challenge = { id: change.doc.id, ...change.doc.data() } as {
          id: string;
          status: string;
        };
        console.log('Challenge change:', change.type, challenge);

        if (challenge.status === 'accepted') {
          console.log('Accepted challenge detected, navigating to game page');
          router.push(`/game/${challenge.id}`);
        }
      });

      const updatedChallenges = snapshot.docs
        .filter(doc => doc.data().status === 'pending')
        .map(doc => ({ 
          id: doc.id, 
          challengerName: doc.data().challengerName, 
          betAmount: doc.data().betAmount,
          status: doc.data().status
        }));
      console.log('Updated pending challenges:', updatedChallenges);
      setChallenges(updatedChallenges);
    }, (error) => {
      console.error('Error in challenges listener:', error);
      if (error instanceof Error) {
        toast.error(`Unable to fetch challenges: ${error.message}`);
      } else {
        toast.error('Unable to fetch challenges: An unknown error occurred');
      }
    });

    return () => {
      unsubscribe();
      console.log('Challenge listener unsubscribed');
    };
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      } else {
        const fetchUserData = async () => {
          try {
            setLoading(true)
            setProgress(25)
            const userDocRef = doc(db, 'users', user.uid)
            const userDocSnap = await getDoc(userDocRef)
            
            setProgress(50)
            if (userDocSnap.exists()) {
              const data = userDocSnap.data() as UserData
              setUserData(data)
              setRecentMatches(data.recentMatches || [])
              form.reset({
                username: data.username || "",
                psnName: data.psnName || "",
                email: data.email || "",
              })
            } else {
              const newUserData: UserData = {
                id: user.uid,
                email: user.email || '',
                username: user.displayName || user.email?.split('@')[0] || 'User',
                psnName: "",
                recentMatches: [],
                totalMatches: 0,
                winRate: 0,
                rank: 0,
                createdAt: new Date().toISOString(),
                // avatarUrl: '', // Optional: Initialize if needed
              }
              await setDoc(userDocRef, newUserData)
              setUserData(newUserData)
              form.reset({
                username: newUserData.username,
                psnName: newUserData.psnName,
                email: newUserData.email || "",
              })
            }
            setProgress(75)
          } catch (err) {
            console.error('Error fetching/creating user data:', err)
          } finally {
            setLoading(false)
            setProgress(100)
          }
        }

        fetchUserData()
      }
    }
  }, [user, authLoading, router, form])

  useEffect(() => {
    if (userData?.avatarUrl) {
      setAvatarUrl(userData.avatarUrl)
    }
  }, [userData])

  useEffect(() => {
    const interval = setInterval(() => {
      setFlashWin(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username,
          avatarUrl: doc.data().avatarUrl,
          isOnline: doc.data().isOnline
        }));
        setAllUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
        if (error instanceof Error) {
          toast.error(`Unable to fetch users: ${error.message}`);
        } else {
          toast.error('Unable to fetch users: An unknown error occurred');
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchAllUsers()
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchRecentMatches = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          setRecentMatches(userSnap.data().recentMatches || [])
        }
      }
    }

    fetchRecentMatches()
  }, [user])

  useEffect(() => {
    if (!user) {
      console.log('No user available for fetching notifications');
      return;
    }

    console.log('Fetching notifications for user:', user.uid);

    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          where('read', '==', false),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          console.log('Notification snapshot received');
          const newNotifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('New notifications:', newNotifications);
          setNotifications(newNotifications);
        }, (error) => {
          console.error('Error in notification listener:', error);
          if (error instanceof Error) {
            toast.error(`Unable to fetch notifications: ${error.message}`);
          } else {
            toast.error('Unable to fetch notifications: An unknown error occurred');
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up notification listener:', error);
        if (error instanceof Error) {
          toast.error(`Unable to set up notification listener: ${error.message}`);
        } else {
          toast.error('Unable to set up notification listener: An unknown error occurred');
        }
      }
    };

    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        updateOnlineStatus(user.uid, true)
      } else {
        // User is signed out
        if (userData) {
          updateOnlineStatus(userData.id, false)
        }
      }
    })

    return () => unsubscribe()
  }, [userData])

  useEffect(() => {
    const usersRef = collection(db, 'users')
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const onlineUserIds = snapshot.docs
        .filter(doc => doc.data().isOnline)
        .map(doc => doc.id)
      setOnlineUsers(onlineUserIds)
    })

    return () => unsubscribe()
  }, [])

  const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { isOnline })
  }

  const handleAcceptChallenge = async (challengeId: string) => {
    if (balance <= 0) {
      toast.error("You don't have sufficient funds to accept a challenge.");
      return;
    }

    // Fetch the challenge details first
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);

    if (!challengeSnap.exists()) {
      toast.error("Challenge not found.");
      return;
    }

    const challengeData = challengeSnap.data();
    const betAmount = challengeData.betAmount;

    if (betAmount > balance) {
      toast.error("You don't have sufficient funds to accept this challenge.");
      return;
    }

    setIsAccepting(true);
    setAcceptProgress(0);
    setChallengeModalOpen(true);
    setActiveChallenge(challengeId);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setAcceptProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      await updateDoc(challengeRef, {
        status: 'accepted',
        acceptedAt: new Date()
      });

      // Mark the notification as read
      const notificationQuery = query(
        collection(db, 'notifications'),
        where('challengeId', '==', challengeId),
        where('userId', '==', user?.uid)
      );
      const notificationSnapshot = await getDocs(notificationQuery);
      notificationSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { read: true });
      });

      clearInterval(interval);
      setAcceptProgress(100);

      // Navigate to the game page
      router.push(`/game/${challengeId}`);
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast.error('Failed to accept challenge. Please try again.');
    } finally {
      setIsAccepting(false);
      setChallengeModalOpen(false);
      setActiveChallenge(null);
    }
  };

  const handleDeclineChallenge = async (challengeId: string) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, { status: 'declined' });

      // Mark the notification as read
      const notificationQuery = query(
        collection(db, 'notifications'),
        where('challengeId', '==', challengeId),
        where('userId', '==', user?.uid)
      );
      const notificationSnapshot = await getDocs(notificationQuery);
      notificationSnapshot.forEach(async (doc) => {
        await updateDoc(doc.ref, { read: true });
      });
    } catch (error) {
      console.error('Error declining challenge:', error);
      // Show an error message to the user
    }
  }

  const handleEditProfile = () => {
    if (isEditing) {
      // Save profile
      form.handleSubmit(onSubmit)()
    } else {
      // Start editing
      setIsEditing(true)
    }
  }

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user) {
      console.error('User is not authenticated')
      return
    }

    try {
      const userDocRef = doc(db, 'users', user.uid)
      await updateDoc(userDocRef, {
        username: values.username,
        psnName: values.psnName,
        email: values.email,
      })
      setUserData(prevData => ({
        ...prevData,
        username: values.username,
        psnName: values.psnName,
        email: values.email,
      } as UserData))
      setIsEditing(false)
      // Optionally, show a success message
    } catch (error) {
      console.error('Error updating profile:', error)
      // Optionally, show an error message
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLocationSearch = () => {
    // Add your location search functionality here
    console.log("Location search clicked")
    // For example, you could open a modal or navigate to a search page
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Optionally, you can show an error message to the user
    }
  }

  const handleChallengeAccepted = (challengeId: string) => {
    setActiveChallenge(challengeId)
  }

  const handleMatchStart = () => {
    setMatchStarted(true)
  }

  const handleMatchEnd = async (challenge: {
    id: string;
    challengerId: string;
    opponentId: string;
    challengerScore: number;
    opponentScore: number;
    betAmount: number;
    game: string;
  }) => {
    if (!user) {
      console.error('Missing user data')
      return
    }

    try {
      // Fetch challenger and opponent data
      const challengerDoc = await getDoc(doc(db, 'users', challenge.challengerId))
      const opponentDoc = await getDoc(doc(db, 'users', challenge.opponentId))

      if (!challengerDoc.exists() || !opponentDoc.exists()) {
        console.error('Challenger or opponent data not found')
        return
      }

      const challengerData = challengerDoc.data()
      const opponentData = opponentDoc.data()

      const challengeRef = doc(db, 'challenges', challenge.id)
      await updateDoc(challengeRef, {
        status: 'completed',
        challengerScore: challenge.challengerScore,
        opponentScore: challenge.opponentScore,
        endTime: new Date()
      })

      // Add the match result to a separate 'matchResults' collection
      const matchResultsRef = collection(db, 'matchResults')
      await addDoc(matchResultsRef, {
        status: 'completed',
        challengerId: challenge.challengerId,
        opponentId: challenge.opponentId,
        challengerUsername: challengerData.username,
        opponentUsername: opponentData.username,
        game: challenge.game || 'Unknown Game',
        date: new Date().toISOString(),
        betAmount: challenge.betAmount || 0, // Add a fallback value
        challengerScore: challenge.challengerScore,
        opponentScore: challenge.opponentScore,
        winner: challenge.challengerScore > challenge.opponentScore ? challenge.challengerId : challenge.opponentId
      })

      // Update user balances
      const winnerRef = doc(db, 'users', challenge.challengerScore > challenge.opponentScore ? challenge.challengerId : challenge.opponentId)
      const loserRef = doc(db, 'users', challenge.challengerScore > challenge.opponentScore ? challenge.opponentId : challenge.challengerId)

      await updateDoc(winnerRef, {
        balance: increment(challenge.betAmount)
      })

      await updateDoc(loserRef, {
        balance: increment(-challenge.betAmount)
      })

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
        winner: challenge.challengerScore > challenge.opponentScore ? 'challenger' : 'opponent'
      }

      // Update local state
      setRecentMatches(prevMatches => [newMatch, ...prevMatches.slice(0, 4)])

      // Update Firestore
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        recentMatches: arrayUnion(newMatch)
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error ending match:', error)
      // Handle the error (e.g., show an error message to the user)
    }
  }

  const handleChallenge = async (betAmount: number) => {
    if (!user || !selectedOpponent) return;

    if (balance <= 0) {
      toast.error("You don't have sufficient funds to start a challenge.");
      return;
    }

    if (betAmount > balance) {
      toast.error("The bet amount cannot exceed your current balance.");
      return;
    }

    try {
      console.log('Creating challenge...');
      const challengeRef = await addDoc(collection(db, 'challenges'), {
        challengerId: user.uid,
        challengerName: userData?.username,
        opponentId: selectedOpponent.id,
        opponentName: selectedOpponent.username,
        betAmount: betAmount,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      console.log('Challenge created with ID:', challengeRef.id);

      console.log('Creating notification for opponent...');
      const notificationRef = await addDoc(collection(db, 'notifications'), {
        userId: selectedOpponent.id,
        type: 'challenge',
        challengeId: challengeRef.id,
        message: `New challenge from ${userData?.username}`,
        betAmount: betAmount,
        createdAt: new Date().toISOString(),
        read: false
      });
      console.log('Notification created with ID:', notificationRef.id);

      setChallengeModalOpen(false);
      console.log('Challenge created successfully');
      
      toast.success('Challenge sent successfully!');
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Failed to create challenge. Please try again.');
    }
  }

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          if (doc.data().lastTransaction) {
            setTransactionStatus(`Last transaction: ${doc.data().lastTransaction.status}`);
          }
        } else {
          console.error('User document not found');
          toast.error('Failed to load user data');
        }
      }, (error) => {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (!userData) {
      setLoading(true)
      return
    }

    // Calculate total matches
    setTotalMatches(userData.recentMatches?.length || 0)

    // Calculate win rate
    const wins = userData.recentMatches?.filter(match =>
      (match.winner === 'challenger' && match.challenger.username === userData.username) ||
      (match.winner === 'opponent' && match.opponent.username === userData.username)
    ).length || 0;
    const calculatedWinRate = userData.recentMatches?.length > 0
      ? (wins / userData.recentMatches.length) * 100
      : 0;
    setWinRate(calculatedWinRate)

    // Calculate rank
    const calculateRank = async () => {
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Partial<UserData>)
      }))

      // Calculate win rates for all users
      const userWinRates = usersData.map(user => {
        const userMatches: Match[] = user.recentMatches || []
        const userWins = userMatches.filter(match =>
          (match.winner === 'challenger' && match.challenger.username === user.username) ||
          (match.winner === 'opponent' && match.opponent.username === user.username)
        ).length
        const winRate = userMatches.length > 0 ? (userWins / userMatches.length) * 100 : 0
        return {
          id: user.id,
          winRate: winRate
        }
      })

      // Sort users by win rate in descending order
      userWinRates.sort((a, b) => b.winRate - a.winRate)

      // Find the current user's rank
      const userRank = userWinRates.findIndex(user => user.id === userData.id) + 1
      setRank(userRank)
    }

    calculateRank()
    setLoading(false)
  }, [userData])

  if (authLoading || loading) {
    return <LoadingComponent />
  }

  if (!user || !userData) {
    router.push('/login')
    return null
  }

  // Update the EditableProfileForm to use userData
  function EditableProfileForm({
    form,
    onSubmit,
    avatarPreview,
    handleAvatarChange,
    handleEditProfile,
    isEditing,
  }: {
    form: ReturnType<typeof useForm<z.infer<typeof profileFormSchema>>>
    onSubmit: (values: z.infer<typeof profileFormSchema>) => void
    avatarPreview: string
    handleAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleEditProfile: () => void
    isEditing: boolean
  }) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-20 w-20">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  onError={() => setAvatarError(true)}
                  className="object-cover w-full h-full"
                />
              ) : (
                <AvatarFallback>{userData?.username?.[0] || 'U'}</AvatarFallback>
              )}
            </Avatar>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full bg-purple-700 text-white border-purple-600"
              id="avatar-upload"
              name="avatar-upload"
              autoComplete="off"
            />
          </div>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-yellow-400" htmlFor="username">Username</FormLabel>
                <FormControl>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    {...field}
                    className="bg-purple-700 text-white placeholder-purple-300 border-purple-600 focus-visible:ring-yellow-400"
                    autoComplete="username"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="psnName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-yellow-400" htmlFor="psnName">PSN Name</FormLabel>
                <FormControl>
                  <Input
                    id="psnName"
                    placeholder="Enter your PSN name"
                    {...field}
                    className="bg-purple-700 text-white placeholder-purple-300 border-purple-600 focus-visible:ring-yellow-400"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-yellow-400" htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    {...field}
                    className="bg-purple-700 text-white placeholder-purple-300 border-purple-600 focus-visible:ring-yellow-400"
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <div className="flex space-x-2">
            <Button
              type="submit"
              variant="secondary"
              className="text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-purple-900"
              id="submit-profile"
            >
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="secondary"
                className="text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-purple-900"
                onClick={() => setIsEditing(false)}
                id="cancel-edit-profile"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    )
  }

  // Update the profile section in the main component
  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-purple-900 to-black">
        <div className="relative z-10 container mx-auto p-4 space-y-6 text-white">
          <BoxReveal width="100%" boxColor="#FFD700">
            <header className="flex justify-between items-center mb-6">
              <SparklesText
                text={`Welcome, ${userData.username || 'User'}!`}
                className="text-4xl font-bold text-yellow-400"
                colors={{ first: "#FFD700", second: "#FFA500" }}
                sparklesCount={15}
              />
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-yellow-400 text-purple-900">VIP</Badge>
                <Link href="/funds">
                  <Button variant="secondary" size="small" className="bg-yellow-400 text-purple-900 hover:bg-yellow-500">
                    Manage Funds
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Avatar>
                      <AvatarImage src={userData?.avatarUrl ?? "https://github.com/shadcn.png"} alt="@shadcn" />
                      <AvatarFallback>{userData?.username?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gradient-to-br from-purple-800 to-purple-900 border-2 border-yellow-400">
                    <DropdownMenuLabel className="text-yellow-400">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-yellow-400/50" />
                    <Sheet>
                      <SheetTrigger asChild>
                        <DropdownMenuItem className="text-white hover:bg-purple-700" onSelect={(e) => e.preventDefault()}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                      </SheetTrigger>
                      <SheetContent className="bg-gradient-to-br from-purple-800 to-purple-900 border-2 border-yellow-400">
                        <SheetHeader>
                          <SheetTitle className="text-yellow-400">User Profile</SheetTitle>
                          <SheetDescription className="text-white">
                            View and edit your profile information
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-4">
                          {!isEditing ? (
                            <>
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                  {avatarUrl ? (
                                    <Image
                                      src={avatarUrl}
                                      alt="Profile"
                                      width={80}
                                      height={80}
                                      onError={() => setAvatarError(true)}
                                      className="object-cover w-full h-full"
                                    />
                                  ) : (
                                    <AvatarFallback>{userData?.username?.[0] || 'U'}</AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-bold text-yellow-400">{userData?.username}</h3>
                                  <p className="text-sm text-gray-300">{userData?.email}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-lg font-semibold text-yellow-400">Stats</h4>
                                <p className="text-white">Total Matches: {userData?.totalMatches || 0}</p>
                                <p className="text-white">Win Rate: {userData?.winRate || '0%'}</p>
                                <p className="text-white">Rank: #{userData?.rank || 'N/A'}</p>
                              </div>
                              <Button 
                                variant="secondary"
                                className="text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-purple-900"
                                onClick={handleEditProfile}
                                id="edit-profile-button"
                              >
                                Edit Profile
                              </Button>
                            </>
                          ) : (
                            <EditableProfileForm
                              form={form}
                              onSubmit={onSubmit}
                              avatarPreview={avatarPreview}
                              handleAvatarChange={handleAvatarChange}
                              handleEditProfile={handleEditProfile}
                              isEditing={isEditing}
                            />
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                    <DropdownMenuItem className="text-white hover:bg-purple-700">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-yellow-400/50" />
                    <DropdownMenuItem 
                      className="text-white hover:bg-purple-700"
                      onSelect={(e) => {
                        e.preventDefault()
                        handleSignOut()
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
          </BoxReveal>

          <BoxReveal width="100%" boxColor="#4B0082">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Total Matches", value: totalMatches.toString(), icon: Gamepad },
                { title: "Win Rate", value: `${winRate.toFixed(1)}%`, icon: Award },
                { title: "Rank", value: `#${rank}`, icon: Award },
                { title: "Game", value: "FIFA 1v1", icon: Gamepad },
              ].map((item, index) => (
                <Card key={index} className="bg-gradient-to-br from-yellow-600 to-yellow-800 border-4 border-yellow-400 shadow-lg overflow-hidden group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold text-white">{item.title}</CardTitle>
                    {item.title === "Total Matches" ? (
                      <Link href="/rooms">
                        <item.icon className="h-6 w-6 text-yellow-400 cursor-pointer" />
                      </Link>
                    ) : (
                      <item.icon className="h-6 w-6 text-yellow-400" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white animate-bounce">{item.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </BoxReveal>

          <div className="grid gap-6 md:grid-cols-2">
            <BoxReveal width="100%" boxColor="#8B0000">
              <Card className="col-span-2 md:col-span-1 bg-gradient-to-br from-red-800 to-red-900 border-4 border-yellow-400 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-yellow-400">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="w-full">
                        <ShinyButton
                          text="Submit Match Result"
                          className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold"
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 bg-gradient-to-br from-red-800 to-red-900 border-2 border-yellow-400 text-white">
                      <div className="grid gap-4">
                        <h4 className="font-medium leading-none text-yellow-400">Submit Match Result</h4>
                        <p className="text-sm text-gray-300">
                          Enter the details of your recent match.
                        </p>
                        <div className="space-y-2">
                          <label htmlFor="yourUsername" className="block text-sm font-medium text-yellow-400">Your Username</label>
                          <Input
                            id="yourUsername"
                            type="text"
                            placeholder="Enter your username"
                            className="bg-red-700 text-white placeholder-red-300 border-red-600 focus-visible:ring-yellow-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="opponentUsername" className="block text-sm font-medium text-yellow-400">Opponent's Username</label>
                          <Input
                            id="opponentUsername"
                            type="text"
                            placeholder="Enter opponent's username"
                            className="bg-red-700 text-white placeholder-red-300 border-red-600 focus-visible:ring-yellow-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="finalScore" className="block text-sm font-medium text-yellow-400">Final Score</label>
                          <Input
                            id="finalScore"
                            type="text"
                            placeholder="e.g., 2-1"
                            className="bg-red-700 text-white placeholder-red-300 border-red-600 focus-visible:ring-yellow-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="describeGame" className="block text-sm font-medium text-yellow-400">Describe Game</label>
                          <textarea
                            id="describeGame"
                            className="w-full h-24 p-2 text-sm text-white bg-red-700 rounded-md resize-none placeholder-red-300 border-red-600 focus-visible:ring-yellow-400"
                            placeholder="Briefly describe the game..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="moreDetails" className="block text-sm font-medium text-yellow-400">More Details</label>
                          <textarea
                            id="moreDetails"
                            className="w-full h-24 p-2 text-sm text-white bg-red-700 rounded-md resize-none placeholder-red-300 border-red-600 focus-visible:ring-yellow-400"
                            placeholder="Add any additional details..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="photoUpload" className="block text-sm font-medium text-yellow-400">Upload Photos (2 max)</label>
                          <Input
                            id="photoUpload"
                            type="file"
                            accept="image/*"
                            multiple
                            max={2}
                            className="bg-red-700 text-white file:bg-yellow-400 file:text-red-900 file:border-0 file:font-bold file:hover:bg-yellow-500"
                          />
                        </div>
                        <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold">
                          Submit Result
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="w-full">
                        <ShinyButton
                          text="Submit Game Issue"
                          className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold"
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 bg-gradient-to-br from-purple-800 to-purple-900 border-2 border-yellow-400 text-white">
                      <div className="grid gap-4">
                        <h4 className="font-medium leading-none text-yellow-400">Report Game Issue</h4>
                        <p className="text-sm text-gray-300">
                          Provide details about the game issue you encountered. All fields are editable.
                        </p>
                        <div className="space-y-2">
                          <label htmlFor="gameName" className="block text-sm font-medium text-yellow-400">Game Name</label>
                          <Input
                            id="gameName"
                            type="text"
                            placeholder="Enter the game name"
                            className="bg-purple-700 text-white placeholder-purple-300 border-purple-600 focus-visible:ring-yellow-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="teamName" className="block text-sm font-medium text-yellow-400">Team Name</label>
                          <Input
                            id="teamName"
                            type="text"
                            placeholder="Enter your team name"
                            className="bg-purple-700 text-white placeholder-purple-300 border-purple-600 focus-visible:ring-yellow-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="finalResult" className="block text-sm font-medium text-yellow-400">Final Result</label>
                          <Input
                            id="finalResult"
                            type="text"
                            placeholder="e.g., 2-1"
                            className="bg-purple-700 text-white placeholder-purple-300 border-purple-600 focus-visible:ring-yellow-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="issueDescription" className="block text-sm font-medium text-yellow-400">Issue Description</label>
                          <textarea
                            id="issueDescription"
                            className="w-full h-24 p-2 text-sm text-gray-900 bg-gray-100 rounded-md resize-none"
                            placeholder="Describe the issue you encountered..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="photoUpload" className="block text-sm font-medium text-yellow-400">Upload Photos (2 max)</label>
                          <Input
                            id="photoUpload"
                            type="file"
                            accept="image/*"
                            multiple
                            max={2}
                            className="bg-purple-700 text-white file:bg-yellow-400 file:text-purple-900 file:border-0 file:font-bold file:hover:bg-yellow-500"
                          />
                        </div>
                        <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold">
                          Submit Issue
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <ShinyButton
                    text="LOCATION SEARCH"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold"
                    onClick={handleLocationSearch}
                  />
                  <Link href="/live" passHref className="relative group">
                    <Button 
                      variant="default" 
                      className="w-full gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-all duration-300 ease-in-out transform group-hover:scale-105"
                    >
                      <TvIcon className="h-5 w-5" />
                      Live Matches
                    </Button>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  </Link>
                </CardContent>
              </Card>
            </BoxReveal>

            <BoxReveal width="100%" boxColor="#4B0082">
              <Card className="col-span-2 md:col-span-1 bg-gradient-to-br from-purple-800 to-purple-900 border-4 border-yellow-400 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-yellow-400">Recent Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-4 pr-4">
                      {recentMatches.map((match: Match, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={match.challenger.avatarUrl ?? undefined} alt={match.challenger.username} />
                              <AvatarFallback>{match.challenger.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-yellow-400">vs</span>
                            <Avatar>
                              <AvatarImage src={match.opponent.avatarUrl ?? undefined} alt={match.opponent.username} />
                              <AvatarFallback>{match.opponent.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium leading-none text-yellow-400">
                                {match.challenger.username} vs {match.opponent.username}
                              </p>
                              <p className="text-sm text-gray-400">{match.game}</p>
                              <p className="text-sm text-gray-400">
                                Winner: {match.winner === 'challenger' ? match.challenger.username : 
                                          match.winner === 'opponent' ? match.opponent.username : 'Draw'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </BoxReveal>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <BoxReveal width="100%" boxColor="#4B0082">
              <Card className="col-span-2 bg-gradient-to-br from-purple-800 to-purple-900 border-4 border-yellow-400 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-yellow-400">Find Users to Bet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-indigo-700 text-white placeholder-indigo-300 border-indigo-600 focus-visible:ring-yellow-400"
                    />
                    <ShinyButton text="Search" className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900" />
                  </div>
                  <ScrollArea className="h-[200px] w-full rounded-md border border-indigo-600 p-4">
                    {isLoadingUsers ? (
                      <div className="flex justify-center items-center h-full">
                        <span className="text-yellow-400">Loading users...</span>
                      </div>
                    ) : (
                      <div className="space-y-2 pr-4">
                        {allUsers
                          .filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((opponent) => (
                            <TooltipProvider key={opponent.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-between bg-indigo-700 p-2 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <Avatar>
                                        <AvatarImage src={opponent.avatarUrl ?? undefined} alt={opponent.username} />
                                        <AvatarFallback>{opponent.username[0]}</AvatarFallback>
                                      </Avatar>
                                      <span className="text-white">{opponent.username}</span>
                                    </div>
                                    <ShinyButton
                                      text="Challenge"
                                      className={`bg-yellow-400 hover:bg-yellow-500 text-indigo-900 ${balance <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      onClick={() => {
                                        if (balance <= 0) {
                                          toast.error("You don't have sufficient funds to start a challenge.");
                                        } else {
                                          setSelectedOpponent(opponent);
                                          setChallengeModalOpen(true);
                                        }
                                      }}
                                      disabled={balance <= 0}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {balance <= 0 ? (
                                    <p>Top up your balance to challenge users</p>
                                  ) : (
                                    <p>Click to challenge this user</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </BoxReveal>
          </div>

          <BoxReveal width="100%" boxColor="#006400">
            <Card className="bg-gradient-to-br from-green-800 to-green-900 border-4 border-yellow-400 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-yellow-400">Leaderboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { rank: 1, name: "ChampionGamer", wins: 120 },
                  { rank: 2, name: "ProPlayer99", wins: 115 },
                  { rank: 3, name: "GameMaster", wins: 110 },
                ].map((player) => (
                  <div key={player.rank} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`font-bold text-2xl ${flashWin ? 'text-yellow-400' : 'text-white'} transition-colors duration-300`}>{player.rank}</span>
                      <Avatar>
                        <AvatarFallback>{player.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-yellow-400">{player.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <span className={`${flashWin ? 'text-yellow-400' : 'text-white'} font-bold transition-colors duration-300`}>{player.wins} wins</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </BoxReveal>

          <BoxReveal width="100%" boxColor="#008080">
            <Card className="bg-gradient-to-br from-teal-800 to-teal-900 border-4 border-yellow-400 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-yellow-400">Notifications</CardTitle>
                <CardDescription className="text-white">You have {notifications.length} unread messages.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <AnimatedList className="space-y-4 pr-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-4"
                    >
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-yellow-400" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-white">
                          {notification.message}
                        </p>
                        <p className="text-sm text-teal-300">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        {notification.type === 'challenge' && (
                          <>
                            <p className="text-sm font-medium text-yellow-400">
                              Bet Amount: ${notification.betAmount}
                            </p>
                            {isAccepting && notification.challengeId === activeChallenge ? (
                              <Progress value={acceptProgress} className="w-full mt-2" />
                            ) : (
                              <div className="flex space-x-2 mt-2">
                                <Button 
                                  size="small" 
                                  onClick={() => handleAcceptChallenge(notification.challengeId)}
                                  className={`bg-green-500 hover:bg-green-600 text-white ${balance < notification.betAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={balance < notification.betAmount}
                                >
                                  Accept
                                </Button>
                                <Button 
                                  size="small" 
                                  onClick={() => handleDeclineChallenge(notification.challengeId)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Decline
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </AnimatedList>
              </CardContent>
            </Card>
          </BoxReveal>
        </div>
      </div>
      <ChallengeModal
        isOpen={challengeModalOpen}
        onClose={() => setChallengeModalOpen(false)}
        opponent={selectedOpponent}
        onChallenge={handleChallenge}
        isAccepting={isAccepting}
        acceptProgress={acceptProgress}
      />
    </>
  )
}