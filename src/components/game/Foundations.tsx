'use client'

import { Card as CardType } from '@/types/game'
import { Card } from './Card'

interface FoundationsProps {
  foundations: CardType[][]
  onFoundationClick: (foundationIndex: number) => void
  selectedCard?: { type: string; index: number; cardIndex?: number } | null
  autoCompleteHighlight?: {
    source?: {type: 'freecell' | 'tableau', index: number}
    destination?: {type: 'foundation', index: number}
  }
}


export function Foundations({ foundations, onFoundationClick, selectedCard, autoCompleteHighlight }: FoundationsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-gray-200">Foundations</div>
      <div className="flex gap-2">
        {foundations.map((foundation, index) => {
          const topCard = foundation.length > 0 ? foundation[foundation.length - 1] : null
          const isSelected = selectedCard?.type === 'foundation' && selectedCard?.index === index
          const isDestinationHighlighted = autoCompleteHighlight?.destination?.type === 'foundation' && autoCompleteHighlight?.destination?.index === index
          return (
            <Card
              key={index}
              card={topCard}
              isSelected={isSelected}
              onClick={() => onFoundationClick(index)}
              className={`hover:bg-green-50 ${isDestinationHighlighted ? 'animate-pulse ring-4 ring-blue-400 ring-opacity-75 scale-110' : ''}`}
            />
          )
        })}
      </div>
    </div>
  )
}