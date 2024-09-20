"use client"

import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const matches = [
  { id: 1, teams: "Brazil vs Argentina", score: "2 - 1", time: "67'" },
  { id: 2, teams: "Germany vs France", score: "0 - 0", time: "23'" },
  { id: 3, teams: "Spain vs Italy", score: "1 - 2", time: "89'" },
  { id: 4, teams: "England vs Netherlands", score: "3 - 2", time: "45+2'" },
]

const upcomingMatches = [
  { id: 1, teams: "Portugal vs Belgium" },
  { id: 2, teams: "Uruguay vs Colombia" },
  { id: 3, teams: "Mexico vs USA" },
  { id: 4, teams: "Japan vs South Korea" },
]

const BettingOptions = ({ teams }: { teams: string }) => (
  <Tabs defaultValue="match-winner" className="space-y-4">
    <TabsList className="grid w-full grid-cols-3 gap-2">
      <TabsTrigger value="match-winner" className="bg-blue-100 hover:bg-blue-200">Match Winner</TabsTrigger>
      <TabsTrigger value="first-scorer" className="bg-green-100 hover:bg-green-200">First Scorer</TabsTrigger>
      <TabsTrigger value="total-goals" className="bg-yellow-100 hover:bg-yellow-200">Total Goals</TabsTrigger>
    </TabsList>
    <TabsContent value="match-winner" className="bg-blue-50 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="small">{teams.split(' vs ')[0]}</Button>
        <Button variant="secondary" size="small">{teams.split(' vs ')[1]}</Button>
        <Button variant="secondary" size="small" className="col-span-2">Draw</Button>
      </div>
    </TabsContent>
    <TabsContent value="first-scorer" className="bg-green-50 p-4 rounded-lg">
      <ScrollArea className="h-[100px]">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="small">Player 1</Button>
          <Button variant="secondary" size="small">Player 2</Button>
          <Button variant="secondary" size="small">Player 3</Button>
          <Button variant="secondary" size="small">Player 4</Button>
          <Button variant="secondary" size="small">Player 5</Button>
          <Button variant="secondary" size="small">Player 6</Button>
        </div>
      </ScrollArea>
    </TabsContent>
    <TabsContent value="total-goals" className="bg-yellow-50 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="small">Under 1.5</Button>
        <Button variant="secondary" size="small">Over 1.5</Button>
        <Button variant="secondary" size="small">Under 2.5</Button>
        <Button variant="secondary" size="small">Over 2.5</Button>
        <Button variant="secondary" size="small">Under 3.5</Button>
        <Button variant="secondary" size="small">Over 3.5</Button>
      </div>
    </TabsContent>
  </Tabs>
)

export default function LivePage() {
  const [isBlinking, setIsBlinking] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps'
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const [liveWinnings, setLiveWinnings] = useState<Array<{ user: string, amount: number }>>([])

  useEffect(() => {
    // Generate live winnings on the client-side only
    const generatedWinnings = [...Array(10)].map(() => ({
      user: `User${Math.floor(Math.random() * 1000)}`,
      amount: Math.floor(Math.random() * 1000) + 100
    }))
    setLiveWinnings(generatedWinnings)
  }, [])

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Live Matches</h1>
        
        <div className="relative mb-6">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {matches.map((match) => (
                <div key={match.id} className="flex-[0_0_100%] min-w-0 pl-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current FIFA Match</CardTitle>
                      <CardDescription>{match.teams}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold mb-2">Score: {match.score}</div>
                      <div className="text-sm text-muted-foreground mb-4">Time: {match.time}</div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="secondary"
                            size="small"
                            className="transition-colors bg-black text-white hover:bg-gray-800"
                          >
                            Bet Now <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <BettingOptions teams={match.teams} />
                        </PopoverContent>
                      </Popover>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="small"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white hover:bg-gray-800"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous match</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="small"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black text-white hover:bg-gray-800"
                onClick={scrollNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next match</TooltipContent>
          </Tooltip>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Live Winnings</CardTitle>
            <CardDescription>Recent wins by other users</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <ul className="space-y-2">
                {liveWinnings.map((winning, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <span>{winning.user}</span>
                    <span className="font-bold text-green-600">${winning.amount}</span>
                  </motion.li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <Tabs defaultValue="upcoming" className="mb-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Matches</CardTitle>
                <CardDescription>Matches you can bet on</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {upcomingMatches.map((match, index) => (
                    <motion.li
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-center justify-between"
                    >
                      <span>{match.teams}</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="secondary"
                            size="small"
                            className="transition-colors bg-black text-white hover:bg-gray-800"
                          >
                            Bet Now <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <BettingOptions teams={match.teams} />
                        </PopoverContent>
                      </Popover>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}