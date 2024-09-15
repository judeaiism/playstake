import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Globe from '@/components/magicui/globe'
import { AnimatedList } from '@/components/magicui/animated-list'
import ShinyButton from '@/components/magicui/shiny-button'
import { VelocityScroll } from '@/components/magicui/scroll-based-velocity'
import NumberTicker from '@/components/magicui/number-ticker'
import { MagicCard } from '@/components/magicui/magic-card'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Globe className="absolute inset-0 z-0" />
      <div className="relative z-10 min-h-screen bg-gradient-to-br from-purple-700/70 to-red-700/70 text-white p-8">
        <header className="mb-12 text-center">
          <VelocityScroll text="PLAYSTAKE" default_velocity={3} className="text-4xl font-bold mb-6" />
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <ShinyButton text="Login" className="bg-yellow-500 text-purple-900" />
            </Link>
            <Link href="/signup">
              <ShinyButton text="Sign Up" className="bg-green-500 text-purple-900" />
            </Link>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MagicCard className="bg-blue-600 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Match and Play</h2>
            <div className="space-y-4">
              <Button className="w-full bg-yellow-500 text-purple-900 hover:bg-yellow-400">Find Opponent</Button>
              <Button className="w-full bg-yellow-500 text-purple-900 hover:bg-yellow-400">Schedule Match</Button>
              <Button className="w-full bg-yellow-500 text-purple-900 hover:bg-yellow-400">Start Gaming Session</Button>
            </div>
          </MagicCard>

          <MagicCard className="bg-purple-600 rounded-xl p-6 shadow-lg h-[300px] flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
            <div className="flex-grow overflow-hidden">
              <AnimatedList delay={2000} className="h-full">
                {[
                  { player: 'Player123', game: 'FIFA 23', result: 'Win' },
                  { player: 'GamerPro', game: 'Fortnite', result: 'Loss' },
                  { player: 'PSNChamp', game: 'Call of Duty', result: 'Win' },
                ].map((match, index) => (
                  <div key={index} className="flex justify-between items-center bg-purple-700 rounded-lg p-2 w-full mb-2">
                    <div>
                      <div className="font-bold">{match.player}</div>
                      <div className="text-sm">{match.game}</div>
                    </div>
                    <div className={`px-2 py-1 rounded ${match.result === 'Win' ? 'bg-green-500' : 'bg-red-500'}`}>
                      {match.result}
                    </div>
                  </div>
                ))}
              </AnimatedList>
            </div>
          </MagicCard>

          <MagicCard className="bg-green-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            <div className="space-y-2">
              {[
                { rank: 1, player: 'ChampionGamer', wins: 120 },
                { rank: 2, player: 'ProPlayer99', wins: 115 },
                { rank: 3, player: 'GameMaster', wins: 110 },
              ].map((entry, index) => (
                <div key={entry.rank} className="flex justify-between items-center bg-green-600 rounded-lg p-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-500 text-purple-900 rounded-full flex items-center justify-center font-bold mr-2">
                      {entry.rank}
                    </div>
                    <div>{entry.player}</div>
                  </div>
                  <div>
                    <NumberTicker 
                      value={entry.wins} 
                      className="text-yellow-300 font-bold"
                      delay={0.5 * index} // Stagger the animation
                    /> wins
                  </div>
                </div>
              ))}
            </div>
          </MagicCard>
        </main>

        <footer className="mt-12 text-center">
          <p>&copy; 2024 PLAYSTAKE. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
