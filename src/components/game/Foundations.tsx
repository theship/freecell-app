'use client'

import { Card as CardType } from '@/types/game'
import { Card } from './Card'

interface FoundationsProps {
  foundations: CardType[][]
  onFoundationClick: (foundationIndex: number) => void
}


export function Foundations({ foundations, onFoundationClick }: FoundationsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-gray-600">Foundations</div>
      <div className="flex gap-2">
        {foundations.map((foundation, index) => {
          const topCard = foundation.length > 0 ? foundation[foundation.length - 1] : null
          return (
            <Card
              key={index}
              card={topCard}
              onClick={() => onFoundationClick(index)}
              className="hover:bg-green-50"
            />
          )
        })}
      </div>
    </div>
  )
}