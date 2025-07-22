'use client'

import { useState } from 'react'
import { FreeCells } from './FreeCells'
import { Foundations } from './Foundations'
import { Tableau } from './Tableau'
import { RefreshCw, Trophy } from 'lucide-react'

type SelectedCard = {
  type: 'freecell' | 'tableau' | 'foundation'
  index: number
  cardIndex?: number
} | null

interface GameBoardProps {
  gameState: {
    gameState: any
    newGame: () => void
    moveCard: (from: any, to: any) => void
  }
}

export function GameBoard({ gameState: gameStateHook }: GameBoardProps) {
  const { gameState, newGame, moveCard } = gameStateHook
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
      if (column.length > 0 && cardIndex < column.length) {
        // Allow selecting any card in the column, not just the last one
        setSelectedCard({ type: 'tableau', index: columnIndex, cardIndex })
      }
    }
  }

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#007449' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Freecell</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-200">
              Moves: {gameState.moves}
            </div>
            {gameState.isWon && (
              <div className="flex items-center gap-1 text-yellow-300 font-bold">
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
            selectedCard={selectedCard}
          />
          <Foundations 
            foundations={gameState.foundations}
            onFoundationClick={handleFoundationClick}
            selectedCard={selectedCard}
          />
        </div>

        {/* Tableau */}
        <Tableau 
          tableau={gameState.tableau}
          onCardClick={handleTableauClick}
          selectedCard={selectedCard}
        />

        {/* Game Status */}
        {selectedCard && (
          <div className="mt-4 text-sm text-gray-200">
            Selected: {selectedCard.type} {selectedCard.index + 1}
          </div>
        )}
      </div>
    </div>
  )
}