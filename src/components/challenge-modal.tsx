import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface ChallengeModalProps {
  isOpen: boolean
  onClose: () => void
  opponent: { id: string; username: string; avatarUrl?: string } | null
  onChallenge: (betAmount: number) => void
  isAccepting: boolean
  acceptProgress: number
}

export function ChallengeModal({ 
  isOpen, 
  onClose, 
  opponent, 
  onChallenge, 
  isAccepting, 
  acceptProgress 
}: ChallengeModalProps) {
  const [betAmount, setBetAmount] = useState<number>(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChallenge(betAmount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-purple-800 to-purple-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">
            {isAccepting ? "Accepting Challenge" : `Challenge ${opponent?.username}`}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {isAccepting ? "Please wait while the challenge is being accepted..." : "Set the bet amount for your challenge."}
          </DialogDescription>
        </DialogHeader>
        {isAccepting ? (
          <Progress value={acceptProgress} className="w-full" />
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="betAmount" className="text-right text-yellow-400">
                  Bet Amount
                </label>
                <Input
                  id="betAmount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="col-span-3 bg-purple-700 text-white border-purple-600"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit} className="bg-yellow-400 text-purple-900 hover:bg-yellow-500">
                Send Challenge
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}