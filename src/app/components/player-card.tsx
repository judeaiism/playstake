import Image from 'next/image'
import { Player } from '@/types/player'

function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4">
      <div className="relative w-16 h-16 rounded-full overflow-hidden">
        <Image
          src={`/avatars/${player.avatar}`}
          alt={`${player.name}'s avatar`}
          layout="fill"
          objectFit="cover"
          onError={(e) => {
            // If the image fails to load, replace with a default avatar
            e.currentTarget.src = '/avatars/default-avatar.png'
          }}
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{player.name}</h3>
        <p className="text-gray-600">Score: {player.score}</p>
      </div>
    </div>
  )
}

export default PlayerCard
