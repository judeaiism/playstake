import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-red-700 text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">PSN Game Tracker</h1>
        <div className="space-x-4">
          <Button variant="secondary" className="bg-yellow-500 text-purple-900 border-none hover:bg-yellow-400">
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="default" className="bg-green-500 text-purple-900 hover:bg-green-400">
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-blue-600 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Match and Play</h2>
          <p className="mb-4">Find opponents, schedule matches, and track your gaming sessions across various PlayStation games.</p>
          <div className="space-y-4">
            <Button className="w-full bg-yellow-500 text-purple-900 hover:bg-yellow-400">Find Opponent</Button>
            <Button className="w-full bg-yellow-500 text-purple-900 hover:bg-yellow-400">Schedule Match</Button>
            <Button className="w-full bg-yellow-500 text-purple-900 hover:bg-yellow-400">Start Gaming Session</Button>
          </div>
        </section>

        <section className="bg-purple-600 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
          <div className="space-y-2">
            {[
              { player: 'Player123', game: 'FIFA 23', result: 'Win' },
              { player: 'GamerPro', game: 'Fortnite', result: 'Loss' },
              { player: 'PSNChamp', game: 'Call of Duty', result: 'Win' },
            ].map((match, index) => (
              <div key={index} className="flex justify-between items-center bg-purple-700 rounded-lg p-2">
                <div>
                  <div className="font-bold">{match.player}</div>
                  <div className="text-sm">{match.game}</div>
                </div>
                <div className={`px-2 py-1 rounded ${match.result === 'Win' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {match.result}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-green-700 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
          <div className="space-y-2">
            {[
              { rank: 1, player: 'ChampionGamer', wins: 120 },
              { rank: 2, player: 'ProPlayer99', wins: 115 },
              { rank: 3, player: 'GameMaster', wins: 110 },
            ].map((entry) => (
              <div key={entry.rank} className="flex justify-between items-center bg-green-600 rounded-lg p-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-500 text-purple-900 rounded-full flex items-center justify-center font-bold mr-2">
                    {entry.rank}
                  </div>
                  <div>{entry.player}</div>
                </div>
                <div>{entry.wins} wins</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-12 text-center">
        <p>&copy; 2024 PSN Game Tracker. All rights reserved.</p>
      </footer>
    </div>
  )
}