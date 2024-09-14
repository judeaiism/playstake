'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import FlickeringGrid from "@/components/magicui/flickering-grid"
import BoxReveal from "@/components/magicui/box-reveal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award, Gamepad, ChevronRight, DollarSign, PlusCircle, MinusCircle, Search, Percent, User, Settings, LogOut, BellIcon, CheckIcon, CheckCircle } from "lucide-react"
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
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import Link from 'next/link'
import SparklesText from "@/components/magicui/sparkles-text"

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

export default function Dashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  const [flashWin, setFlashWin] = useState(false)
  const [balance, setBalance] = useState(1000)
  const [searchQuery, setSearchQuery] = useState('')
  const [betOption, setBetOption] = useState("online")
  const [isEditing, setIsEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState("https://github.com/shadcn.png")

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "John Doe",
      psnName: "",
      email: "johndoe@example.com",
    },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setFlashWin(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const handleAddBalance = () => {
    setBalance(prevBalance => prevBalance + 100)
  }

  const handleWithdraw = () => {
    if (balance >= 100) {
      setBalance(prevBalance => prevBalance - 100)
    }
  }

  const notifications = [
    {
      title: "New challenge from ProGamer123",
      description: "1 hour ago",
    },
    {
      title: "You won $50 in your last match!",
      description: "2 hours ago",
    },
    {
      title: "Weekly tournament starting soon",
      description: "3 hours ago",
    },
  ]

  function onSubmit(values: z.infer<typeof profileFormSchema>) {
    // TODO: Update profile logic here
    console.log(values)
    console.log("Avatar file:", avatarFile)
    setIsEditing(false)
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

  return (
    <div className="relative min-h-screen">
      <FlickeringGrid
        className="absolute inset-0 z-0"
        color="rgb(255, 215, 0)"
        maxOpacity={0.1}
        flickerChance={0.2}
      />
      <div className="relative z-10 container mx-auto p-4 space-y-6 text-white">
        <BoxReveal width="100%" boxColor="#FFD700">
          <header className="flex justify-between items-center mb-6">
            <SparklesText
              text={`Welcome, ${user.username || 'User'}!`}
              className="text-4xl font-bold text-yellow-400"
              colors={{ first: "#FFD700", second: "#FFA500" }}
              sparklesCount={15}
            />
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-yellow-400 text-purple-900">VIP</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gradient-to-br from-purple-800 to-purple-900 border-2 border-yellow-400">
                  <DropdownMenuLabel className="text-yellow-400">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-yellow-400/50" />
                  <Sheet>
                    <SheetTrigger asChild>
                      <DropdownMenuItem className="text-white hover:bg-purple-700" onSelect={(e) => e.preventDefault()}>
                        <User className="mr-2 h-4 w-4" />
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
                                <AvatarImage src={avatarPreview} alt="@johndoe" />
                                <AvatarFallback>JD</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-xl font-bold text-yellow-400">{form.getValues("username")}</h3>
                                <p className="text-sm text-gray-300">{form.getValues("email")}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-lg font-semibold text-yellow-400">Stats</h4>
                              <p className="text-white">Total Matches: 89</p>
                              <p className="text-white">Win Rate: 64%</p>
                              <p className="text-white">Rank: #42</p>
                            </div>
                            <Button 
                              className="w-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold"
                              onClick={() => setIsEditing(true)}
                            >
                              Edit Profile
                            </Button>
                          </>
                        ) : (
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <div className="flex flex-col items-center space-y-2">
                                <Avatar className="h-20 w-20">
                                  <AvatarImage src={avatarPreview} alt="Profile" />
                                  <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAvatarChange}
                                  className="w-full bg-purple-700 text-white border-purple-600"
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-yellow-400">Username</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="bg-purple-700 text-white border-purple-600" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="psnName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-yellow-400">PSN Name (not public)</FormLabel>
                                    <FormControl>
                                      <Input {...field} className="bg-purple-700 text-white border-purple-600" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-yellow-400">Email</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="email" className="bg-purple-700 text-white border-purple-600" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="flex space-x-2">
                                <Button 
                                  type="submit" 
                                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-bold"
                                >
                                  Save Changes
                                </Button>
                                <Button 
                                  type="button" 
                                  className="flex-1 bg-purple-700 hover:bg-purple-600 text-white"
                                  onClick={() => setIsEditing(false)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </Form>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                  <DropdownMenuItem className="text-white hover:bg-purple-700">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-yellow-400/50" />
                  <DropdownMenuItem className="text-white hover:bg-purple-700">
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
              { title: "Total Matches", value: "89", icon: Gamepad },
              { title: "Win Rate", value: "64%", icon: Award },
              { title: "Rank", value: "#42", icon: Award },
              { title: "Favorite Game", value: "FIFA 23", icon: Gamepad },
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
                    {[
                      { opponent: "Player123", result: "Win", game: "FIFA 23", avatarSrc: "/avatars/player123.png" },
                      { opponent: "GamerPro", result: "Loss", game: "Fortnite", avatarSrc: "/avatars/gamerpro.png" },
                      { opponent: "PSNChamp", result: "Win", game: "Call of Duty", avatarSrc: "/avatars/psnchamp.png" },
                      { opponent: "XboxKing", result: "Win", game: "Halo Infinite", avatarSrc: "/avatars/xboxking.png" },
                      { opponent: "PCMaster", result: "Loss", game: "League of Legends", avatarSrc: "/avatars/pcmaster.png" },
                      { opponent: "MobileGamer", result: "Win", game: "PUBG Mobile", avatarSrc: "/avatars/mobilegamer.png" },
                    ].map((match, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={match.avatarSrc} alt={match.opponent} />
                            <AvatarFallback>{match.opponent.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none text-yellow-400">{match.opponent}</p>
                            <p className="text-sm text-gray-400">{match.game}</p>
                          </div>
                        </div>
                        <div className={`${match.result === "Win" ? 'bg-green-500' : 'bg-red-500'} text-white font-bold px-4 py-1 rounded-full`}>
                          {match.result}
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
          <BoxReveal width="100%" boxColor="#00008B">
            <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-4 border-yellow-400 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-yellow-400">Balance Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Current Balance:</span>
                  <span className="text-2xl font-bold text-green-400">${balance}</span>
                </div>
                <div className="flex space-x-4">
                  <Button onClick={handleAddBalance} className="flex-1 bg-green-500 hover:bg-green-600">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add $100
                  </Button>
                  <Button onClick={handleWithdraw} className="flex-1 bg-red-500 hover:bg-red-600" disabled={balance < 100}>
                    <MinusCircle className="mr-2 h-4 w-4" /> Withdraw $100
                  </Button>
                </div>
              </CardContent>
            </Card>
          </BoxReveal>

          <BoxReveal width="100%" boxColor="#4B0082">
            <Card className="bg-gradient-to-br from-indigo-800 to-indigo-900 border-4 border-yellow-400 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-yellow-400">Find Users to Bet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="default"
                  size="medium"
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold"
                >
                  Online
                </Button>
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
                <div className="space-y-2">
                  {['BetMaster', 'LuckyGamer', 'HighRoller'].map((user, index) => (
                    <div key={index} className="flex items-center justify-between bg-indigo-700 p-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarFallback>{user[0]}</AvatarFallback>
                        </Avatar>
                        <span>{user}</span>
                      </div>
                      <ShinyButton text="Challenge" className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900" />
                    </div>
                  ))}
                </div>
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

        <BoxReveal width="100%" boxColor="#8B4513">
          <Card className="bg-gradient-to-br from-orange-800 to-orange-900 border-4 border-yellow-400 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-yellow-400">Top Win Ratios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { rank: 1, name: "MoneyMaker", winRatio: 0.75 },
                { rank: 2, name: "LuckyStreak", winRatio: 0.68 },
                { rank: 3, name: "BetKing", winRatio: 0.72 },
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
                    <Percent className="h-5 w-5 text-blue-400" />
                    <span className={`${flashWin ? 'text-yellow-400' : 'text-white'} font-bold transition-colors duration-300`}>{(player.winRatio * 100).toFixed(1)}%</span>
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
              <div className="flex items-center space-x-4 rounded-md border border-teal-700 p-4">
                <BellIcon className="text-yellow-400" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    Push Notifications
                  </p>
                  <p className="text-sm text-teal-300">
                    Send notifications to device.
                  </p>
                </div>
                <Switch className="bg-teal-700 data-[state=checked]:bg-yellow-400" />
              </div>
              <ScrollArea className="h-[200px] w-full rounded-md border border-teal-700 p-4">
                <div className="pr-4">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                    >
                      <span className="flex h-2 w-2 translate-y-1 rounded-full bg-yellow-400" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-teal-300">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </BoxReveal>
      </div>
    </div>
  )
}