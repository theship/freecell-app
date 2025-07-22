'use client'

import { Card as CardType } from '@/types/game'
import { Card } from './Card'

interface TableauProps {
  tableau: CardType[][]
  onCardClick: (columnIndex: number, cardIndex: number) => void
  selectedCard?: { type: string; index: number; cardIndex?: number } | null
}

export function Tableau({ tableau, onCardClick, selectedCard }: TableauProps) {
  return (
    <div className="flex gap-2 mt-6">
      {tableau.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-1 min-h-32">
          <div className="text-xs text-gray-300 text-center mb-1">
            Col {columnIndex + 1}
          </div>
          {column.length === 0 ? (
            <Card 
              card={null} 
              onClick={() => onCardClick(columnIndex, 0)}
              className="hover:bg-yellow-50"
            />
          ) : (
            column.map((card, cardIndex) => (
              <div
                key={card.id}
                style={{
                  zIndex: cardIndex,
                  marginTop: cardIndex === 0 ? '0' : '-4rem'
                }}
              >
                <Card
                  card={card}
                  isSelected={
                    selectedCard?.type === 'tableau' && 
                    selectedCard?.index === columnIndex && 
                    selectedCard?.cardIndex === cardIndex
                  }
                  onClick={() => onCardClick(columnIndex, cardIndex)}
                  className="hover:bg-yellow-50"
                />
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  )
}