import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Award, Gamepad, ChevronRight, DollarSign, PlusCircle, MinusCircle, Search, Percent } from "lucide-react"

export default function Dashboard() {
  const [flashWin, setFlashWin] = useState(false)
  const [balance, setBalance] = useState(1000)
  const [searchQuery, setSearchQuery] = useState('')

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

  return (
    <div className="container mx-auto p-4 space-y-6 bg-gradient-to-br from-purple-900 via-red-900 to-yellow-900 min-h-screen text-white">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-yellow-400 animate-pulse">PLAYSTAKE Dashboard</h1>
        <Avatar className="h-12 w-12 ring-4 ring-yellow-400 ring-offset-4 ring-offset-red-900">
          <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </header>

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
              <item.icon className="h-6 w-6 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white animate-bounce">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2 md:col-span-1 bg-gradient-to-br from-red-800 to-red-900 border-4 border-yellow-400 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-yellow-400">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button className="w-full justify-between bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold">
              Find Random Match
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            <Button className="w-full justify-between bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold" variant="outline">
              Search for Opponent
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            <Button className="w-full justify-between bg-yellow-400 hover:bg-yellow-500 text-red-900 font-bold" variant="outline">
              Submit Match Result
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1 bg-gradient-to-br from-purple-800 to-purple-900 border-4 border-yellow-400 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-yellow-400">Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { opponent: "Player123", result: "Win", game: "FIFA 23" },
                { opponent: "GamerPro", result: "Loss", game: "Fortnite" },
                { opponent: "PSNChamp", result: "Win", game: "Call of Duty" },
              ].map((match, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-8 w-8 ring-2 ring-yellow-400">
                      <AvatarFallback>{match.opponent[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none text-yellow-400">{match.opponent}</p>
                      <p className="text-sm text-gray-400">{match.game}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={match.result === "Win" ? "default" : "secondary"}
                    className={`${match.result === "Win" ? 'bg-green-500' : 'bg-red-500'} text-white font-bold px-4 py-1 rounded-full`}
                  >
                    {match.result}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-4 border-yellow-400 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-yellow-400">Balance Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-800 to-indigo-900 border-4 border-yellow-400 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-yellow-400">Find Users to Bet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-indigo-700 text-white placeholder-indigo-300 border-indigo-600"
                />
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {['BetMaster', 'LuckyGamer', 'HighRoller'].map((user, index) => (
                  <div key={index} className="flex items-center justify-between bg-indigo-700 p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user[0]}</AvatarFallback>
                      </Avatar>
                      <span>{user}</span>
                    </div>
                    <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900">
                      Challenge
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-green-800 to-green-900 border-4 border-yellow-400 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-yellow-400">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { rank: 1, name: "ChampionGamer", wins: 120 },
              { rank: 2, name: "ProPlayer99", wins: 115 },
              { rank: 3, name: "GameMaster", wins: 110 },
            ].map((player) => (
              <div key={player.rank} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`font-bold text-2xl ${flashWin ? 'text-yellow-400' : 'text-white'} transition-colors duration-300`}>{player.rank}</span>
                  <Avatar className="h-8 w-8 ring-2 ring-yellow-400">
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
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-800 to-orange-900 border-4 border-yellow-400 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-yellow-400">Top Win Ratios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { rank: 1, name: "MoneyMaker", winRatio: 0.75 },
              { rank: 2, name: "LuckyStreak", winRatio: 0.68 },
              { rank: 3, name: "BetKing", winRatio: 0.72 },
            ].map((player) => (
              <div key={player.rank} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`font-bold text-2xl ${flashWin ? 'text-yellow-400' : 'text-white'} transition-colors duration-300`}>{player.rank}</span>
                  <Avatar className="h-8 w-8 ring-2 ring-yellow-400">
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}