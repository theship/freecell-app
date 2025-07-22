'use client'

import { Card as CardType } from '@/types/game'
import { Card } from './Card'

interface FreeCellsProps {
  freeCells: (CardType | null)[]
  onCardClick: (cellIndex: number) => void
  selectedCard?: { type: string; index: number; cardIndex?: number } | null
}

export function FreeCells({ freeCells, onCardClick, selectedCard }: FreeCellsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-gray-200">Free Cells</div>
      <div className="flex gap-2">
        {freeCells.map((card, index) => (
          <Card
            key={index}
            card={card}
            isSelected={selectedCard?.type === 'freecell' && selectedCard?.index === index}
            onClick={() => onCardClick(index)}
            className="hover:bg-blue-50"
          />
        ))}
      </div>
    </div>
  )
}