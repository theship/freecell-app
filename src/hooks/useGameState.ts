'use client'

import { useState, useCallback } from 'react'
import { GameState, Card } from '@/types/game'
import { 
  initializeGame, 
  isValidTableauMove, 
  isValidFoundationMove, 
  checkWinCondition
} from '@/lib/game'

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initializeGame)

  const newGame = useCallback(() => {
    setGameState(initializeGame())
  }, [])

  const moveCard = useCallback((
    from: { type: 'freecell' | 'tableau' | 'foundation', index: number, cardIndex?: number },
    to: { type: 'freecell' | 'tableau' | 'foundation', index: number }
  ) => {
    setGameState(prevState => {
      const newState = { ...prevState }
      let cardToMove: Card | null = null

      if (from.type === 'freecell') {
        cardToMove = newState.freeCells[from.index]
        if (!cardToMove) return prevState
      } else if (from.type === 'tableau') {
        const column = newState.tableau[from.index]
        if (column.length === 0) return prevState
        cardToMove = column[column.length - 1]
      } else if (from.type === 'foundation') {
        const foundation = newState.foundations[from.index]
        if (foundation.length === 0) return prevState
        cardToMove = foundation[foundation.length - 1]
      }

      if (!cardToMove) return prevState

      let isValidMove = false

      if (to.type === 'freecell') {
        isValidMove = newState.freeCells[to.index] === null
      } else if (to.type === 'tableau') {
        const targetColumn = newState.tableau[to.index]
        const targetCard = targetColumn.length > 0 ? targetColumn[targetColumn.length - 1] : null
        isValidMove = isValidTableauMove(cardToMove, targetCard)
      } else if (to.type === 'foundation') {
        const targetFoundation = newState.foundations[to.index]
        isValidMove = isValidFoundationMove(cardToMove, targetFoundation)
      }

      if (!isValidMove) return prevState

      if (from.type === 'freecell') {
        newState.freeCells[from.index] = null
      } else if (from.type === 'tableau') {
        newState.tableau[from.index].pop()
      } else if (from.type === 'foundation') {
        newState.foundations[from.index].pop()
      }

      if (to.type === 'freecell') {
        newState.freeCells[to.index] = cardToMove
      } else if (to.type === 'tableau') {
        newState.tableau[to.index].push(cardToMove)
      } else if (to.type === 'foundation') {
        newState.foundations[to.index].push(cardToMove)
      }

      newState.moves++
      newState.isWon = checkWinCondition(newState)

      return newState
    })
  }, [])

  return {
    gameState,
    newGame,
    moveCard
  }
}