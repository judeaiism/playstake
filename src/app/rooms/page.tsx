'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Room = {
  id: string
  name: string
  topic: string
  users: number
}

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'FIFA Fanatics', topic: 'Sports', users: 42 },
    { id: '2', name: 'Call of Duty Squad', topic: 'FPS', users: 78 },
    { id: '3', name: 'Minecraft Builders', topic: 'Sandbox', users: 56 },
    { id: '4', name: 'Fortnite Party', topic: 'Battle Royale', users: 95 },
    { id: '5', name: 'GTA Roleplayers', topic: 'Action', users: 63 },
  ])

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.topic.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-red-700 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Public Chat Rooms</h1>
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white text-purple-900"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="bg-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{room.name}</CardTitle>
                <Badge variant="secondary">{room.topic}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{room.users} users online</p>
                  <Button className="bg-yellow-500 text-purple-900 hover:bg-yellow-400">
                    <Link href={`/rooms/${room.id}`}>Join Room</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredRooms.length === 0 && (
          <p className="text-white text-center mt-4">No rooms found. Try a different search term.</p>
        )}
        <div className="mt-8 text-center">
          <Button className="bg-green-500 text-white hover:bg-green-400">
            Create New Room
          </Button>
        </div>
      </div>
    </div>
  )
}