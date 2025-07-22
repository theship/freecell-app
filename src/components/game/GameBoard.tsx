'use client'

import { useState } from 'react'
import { FreeCells } from './FreeCells'
import { Foundations } from './Foundations'
import { Tableau } from './Tableau'
import { FlyingCard } from './FlyingCard'
import { RefreshCw, Trophy } from 'lucide-react'
import { GameState, Card } from '@/types/game'

type SelectedCard = {
  type: 'freecell' | 'tableau' | 'foundation'
  index: number
  cardIndex?: number
} | null

type FlyingCardAnimation = {
  id: string
  card: Card
  fromPosition: { x: number, y: number }
  toPosition: { x: number, y: number }
}

interface GameBoardProps {
  gameState: {
    gameState: GameState
    newGame: () => void
    moveCard: (from: { type: 'freecell' | 'tableau' | 'foundation', index: number, cardIndex?: number }, to: { type: 'freecell' | 'tableau' | 'foundation', index: number }) => void
    isAutoCompleting: boolean
    autoCompleteHighlight: {
      source?: {type: 'freecell' | 'tableau', index: number}
      destination?: {type: 'foundation', index: number}
    }
  }
}

export function GameBoard({ gameState: gameStateHook }: GameBoardProps) {
  const { gameState, newGame, moveCard, isAutoCompleting, autoCompleteHighlight } = gameStateHook
  const [selectedCard, setSelectedCard] = useState<SelectedCard>(null)
  const [flyingCards, setFlyingCards] = useState<FlyingCardAnimation[]>([])

  const handleFreeCellClick = (cellIndex: number) => {
    if (isAutoCompleting) return // Disable interaction during auto-completion
    
    if (selectedCard) {
      moveCard(selectedCard, { type: 'freecell', index: cellIndex })
      setSelectedCard(null)
    } else if (gameState.freeCells[cellIndex]) {
      setSelectedCard({ type: 'freecell', index: cellIndex })
    }
  }

  const handleFoundationClick = (foundationIndex: number) => {
    if (isAutoCompleting) return // Disable interaction during auto-completion
    
    if (selectedCard) {
      moveCard(selectedCard, { type: 'foundation', index: foundationIndex })
      setSelectedCard(null)
    } else if (gameState.foundations[foundationIndex].length > 0) {
      setSelectedCard({ type: 'foundation', index: foundationIndex })
    }
  }

  const handleTableauClick = (columnIndex: number, cardIndex: number) => {
    if (isAutoCompleting) return // Disable interaction during auto-completion
    
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
    <div className="p-6 min-h-screen relative" style={{ backgroundColor: '#007449' }}>
      {/* Auto-completion status - no blocking overlay */}
      {isAutoCompleting && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-green-600 bg-opacity-95 rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-white">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="font-semibold text-sm">Auto-completing...</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Freecell</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-200">
              Moves: {gameState.moves}
            </div>
            {isAutoCompleting && (
              <div className="flex items-center gap-1 text-blue-300 font-bold animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auto-completing...
              </div>
            )}
            {gameState.isWon && (
              <div className="flex items-center gap-1 text-yellow-300 font-bold animate-bounce">
                <Trophy className="w-4 h-4" />
                You Won!
              </div>
            )}
            {/* <button
              onClick={setTestGame}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              Test Auto
            </button> */}
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
            autoCompleteHighlight={autoCompleteHighlight}
          />
          <Foundations 
            foundations={gameState.foundations}
            onFoundationClick={handleFoundationClick}
            selectedCard={selectedCard}
            autoCompleteHighlight={autoCompleteHighlight}
          />
        </div>

        {/* Tableau */}
        <Tableau 
          tableau={gameState.tableau}
          onCardClick={handleTableauClick}
          selectedCard={selectedCard}
          autoCompleteHighlight={autoCompleteHighlight}
        />

        {/* Game Status */}
        {selectedCard && (
          <div className="mt-4 text-sm text-gray-200">
            Selected: {selectedCard.type} {selectedCard.index + 1}
          </div>
        )}
      </div>
      
      {/* Flying card animations */}
      {flyingCards.map((flyingCard) => (
        <FlyingCard
          key={flyingCard.id}
          card={flyingCard.card}
          fromPosition={flyingCard.fromPosition}
          toPosition={flyingCard.toPosition}
          onComplete={() => {
            setFlyingCards(prev => prev.filter(fc => fc.id !== flyingCard.id))
          }}
        />
      ))}
    </div>
  )
}