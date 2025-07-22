'use client'

import { Card as CardType } from '@/types/game'
import { cn } from '@/lib/utils'

interface CardProps {
  card: CardType | null
  isDragging?: boolean
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

const suitSymbols = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
}

export function Card({ card, isDragging = false, isSelected = false, onClick, className }: CardProps) {
  if (!card) {
    return (
      <div 
        className={cn(
          "w-24 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50",
          isSelected && "bg-yellow-100 border-yellow-400",
          className
        )}
        onClick={onClick}
      >
        <div className="text-gray-400 text-base">Empty</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "w-24 h-40 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between p-2",
        card.color === 'red' ? 'text-red-600' : 'text-black',
        isDragging && 'opacity-50 rotate-12 scale-105',
        isSelected && "bg-yellow-100 border-yellow-400 shadow-lg",
        className
      )}
      onClick={onClick}
    >
      <div className="text-xl font-bold">
        <div>{card.rank}</div>
        <div>{suitSymbols[card.suit]}</div>
      </div>
      <div className="text-4xl font-bold text-center rotate-180">
        {suitSymbols[card.suit]}
      </div>
      <div className="text-xl font-bold rotate-180 text-right">
        <div>{card.rank}</div>
        <div>{suitSymbols[card.suit]}</div>
      </div>
    </div>
  )
}