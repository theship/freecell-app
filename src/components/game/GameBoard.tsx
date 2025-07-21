'use client'

import { useState } from 'react'
import { useGameState } from '@/hooks/useGameState'
import { FreeCells } from './FreeCells'
import { Foundations } from './Foundations'
import { Tableau } from './Tableau'
import { RefreshCw, Trophy } from 'lucide-react'

type SelectedCard = {
  type: 'freecell' | 'tableau' | 'foundation'
  index: number
  cardIndex?: number
} | null

export function GameBoard() {
  const { gameState, newGame, moveCard } = useGameState()
  const [selectedCard, setSelectedCard] = useState<SelectedCard>(null)

  const handleFreeCellClick = (cellIndex: number) => {
    if (selectedCard) {
      moveCard(selectedCard, { type: 'freecell', index: cellIndex })
      setSelectedCard(null)
    } else if (gameState.freeCells[cellIndex]) {
      setSelectedCard({ type: 'freecell', index: cellIndex })
    }
  }

  const handleFoundationClick = (foundationIndex: number) => {
    if (selectedCard) {
      moveCard(selectedCard, { type: 'foundation', index: foundationIndex })
      setSelectedCard(null)
    } else if (gameState.foundations[foundationIndex].length > 0) {
      setSelectedCard({ type: 'foundation', index: foundationIndex })
    }
  }

  const handleTableauClick = (columnIndex: number, cardIndex: number) => {
    if (selectedCard) {
      moveCard(selectedCard, { type: 'tableau', index: columnIndex })
      setSelectedCard(null)
    } else {
      const column = gameState.tableau[columnIndex]
      if (column.length > 0 && cardIndex === column.length - 1) {
        setSelectedCard({ type: 'tableau', index: columnIndex, cardIndex })
      }
    }
  }

  return (
    <div className="p-6 bg-green-200 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Freecell</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Moves: {gameState.moves}
            </div>
            {gameState.isWon && (
              <div className="flex items-center gap-1 text-green-600 font-bold">
                <Trophy className="w-4 h-4" />
                You Won!
              </div>
            )}
            <button
              onClick={newGame}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Game
            </button>
          </div>
        </div>

        {/* Top Area - Free Cells and Foundations */}
        <div className="flex justify-between mb-8">
          <FreeCells 
            freeCells={gameState.freeCells}
            onCardClick={handleFreeCellClick}
          />
          <Foundations 
            foundations={gameState.foundations}
            onFoundationClick={handleFoundationClick}
          />
        </div>

        {/* Tableau */}
        <Tableau 
          tableau={gameState.tableau}
          onCardClick={handleTableauClick}
        />

        {/* Game Status */}
        {selectedCard && (
          <div className="mt-4 text-sm text-gray-600">
            Selected: {selectedCard.type} {selectedCard.index + 1}
          </div>
        )}
      </div>
    </div>
  )
}