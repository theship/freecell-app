'use client'

import { Card as CardType } from '@/types/game'
import { Card } from './Card'
import { useEffect, useState } from 'react'

interface FlyingCardProps {
  card: CardType
  fromPosition: { x: number, y: number }
  toPosition: { x: number, y: number }
  onComplete: () => void
  duration?: number
}

export function FlyingCard({ card, fromPosition, toPosition, onComplete, duration = 800 }: FlyingCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Start animation after a brief delay
    const timer = setTimeout(() => {
      setIsAnimating(true)
    }, 50)

    // Complete animation
    const completeTimer = setTimeout(() => {
      onComplete()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(completeTimer)
    }
  }, [onComplete, duration])

  const translateX = toPosition.x - fromPosition.x
  const translateY = toPosition.y - fromPosition.y

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: fromPosition.x,
        top: fromPosition.y,
        transform: isAnimating ? `translate(${translateX}px, ${translateY}px) scale(0.8)` : 'translate(0, 0)',
        transition: `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }}
    >
      <Card card={card} className="shadow-2xl border-2 border-blue-400" />
    </div>
  )
}