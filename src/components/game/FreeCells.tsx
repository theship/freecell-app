'use client'

import { Card as CardType } from '@/types/game'
import { Card } from './Card'

interface FreeCellsProps {
  freeCells: (CardType | null)[]
  onCardClick: (cellIndex: number) => void
  selectedCard?: { type: string; index: number; cardIndex?: number } | null
  autoCompleteHighlight?: {
    source?: {type: 'freecell' | 'tableau', index: number}
    destination?: {type: 'foundation', index: number}
  }
}

export function FreeCells({ freeCells, onCardClick, selectedCard, autoCompleteHighlight }: FreeCellsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-gray-200">Free Cells</div>
      <div className="flex gap-2">
        {freeCells.map((card, index) => {
          const isSelected = selectedCard?.type === 'freecell' && selectedCard?.index === index
          const isHighlighted = autoCompleteHighlight?.source?.type === 'freecell' && autoCompleteHighlight?.source?.index === index
          return (
            <Card
              key={index}
              card={card}
              isSelected={isSelected}
              onClick={() => onCardClick(index)}
              className={`hover:bg-blue-50 ${isHighlighted ? 'animate-pulse ring-4 ring-green-400 ring-opacity-75' : ''}`}
            />
          )
        })}
      </div>
    </div>
  )
}