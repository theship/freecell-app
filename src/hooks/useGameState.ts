'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { GameState, Card } from '@/types/game'
import { 
  initializeGame, 
  isValidTableauMove, 
  isValidFoundationMove, 
  checkWinCondition,
  canMoveSequence
} from '@/lib/game'
import { useSession } from 'next-auth/react'

// Helper function to record game completion
async function recordGameCompletion(moves: number, timeSeconds: number, won: boolean) {
  try {
    const response = await fetch('/api/stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        moves,
        timeSeconds,
        won
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to record game completion')
    }
  } catch (error) {
    console.error('Error recording game completion:', error)
  }
}

export function useGameState() {
  const { data: session } = useSession()
  const [gameState, setGameState] = useState<GameState>(initializeGame)
  const gameStartTime = useRef<number>(Date.now())
  const previousWonState = useRef<boolean>(false)
  const gameHasStarted = useRef<boolean>(false)

  // Track game completion (won games)
  useEffect(() => {
    if (gameState.isWon && !previousWonState.current && session?.user) {
      const timeSeconds = Math.floor((Date.now() - gameStartTime.current) / 1000)
      recordGameCompletion(gameState.moves, timeSeconds, true)
    }
    previousWonState.current = gameState.isWon
  }, [gameState.isWon, gameState.moves, session?.user])

  // Track when a game has started (first move made)
  useEffect(() => {
    if (gameState.moves > 0 && !gameHasStarted.current) {
      gameHasStarted.current = true
    }
  }, [gameState.moves])

  const newGame = useCallback(() => {
    // Record abandoned game if the previous game was started but not won
    if (gameHasStarted.current && !gameState.isWon && session?.user) {
      const timeSeconds = Math.floor((Date.now() - gameStartTime.current) / 1000)
      console.log('Recording abandoned game:', { moves: gameState.moves, timeSeconds, won: false })
      recordGameCompletion(gameState.moves, timeSeconds, false)
    }

    // Start new game
    setGameState(initializeGame())
    gameStartTime.current = Date.now()
    previousWonState.current = false
    gameHasStarted.current = false
  }, [gameState.isWon, gameState.moves, session?.user])

  const moveCard = useCallback((
    from: { type: 'freecell' | 'tableau' | 'foundation', index: number, cardIndex?: number },
    to: { type: 'freecell' | 'tableau' | 'foundation', index: number }
  ) => {
    setGameState(prevState => {
      const newState = { ...prevState }

      // Handle single card moves (freecells and foundations)
      if (from.type === 'freecell' || from.type === 'foundation' || to.type === 'freecell' || to.type === 'foundation') {
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

        // Remove card from source
        if (from.type === 'freecell') {
          newState.freeCells[from.index] = null
        } else if (from.type === 'tableau') {
          newState.tableau[from.index].pop()
        } else if (from.type === 'foundation') {
          newState.foundations[from.index].pop()
        }

        // Add card to destination
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
      }

      // Handle tableau to tableau sequence moves
      if (from.type === 'tableau' && to.type === 'tableau') {
        const fromColumn = newState.tableau[from.index]
        const toColumn = newState.tableau[to.index]
        
        // Determine starting card index
        const startIndex = from.cardIndex !== undefined ? from.cardIndex : fromColumn.length - 1
        
        if (startIndex < 0 || startIndex >= fromColumn.length) return prevState

        // Check if the sequence from startIndex to end is valid
        if (!canMoveSequence(newState.tableau, from.index, startIndex)) {
          return prevState
        }

        // Get the sequence to move
        const sequenceToMove = fromColumn.slice(startIndex)
        const firstCardInSequence = sequenceToMove[0]

        // For direct sequence moves, we don't need to check max movable sequences
        // The parking space limitation only applies when moving cards through freecells

        // Check if the move is valid
        const targetCard = toColumn.length > 0 ? toColumn[toColumn.length - 1] : null
        if (!isValidTableauMove(firstCardInSequence, targetCard)) {
          return prevState
        }

        // Perform the move
        newState.tableau[from.index] = fromColumn.slice(0, startIndex)
        newState.tableau[to.index] = [...toColumn, ...sequenceToMove]

        newState.moves++
        newState.isWon = checkWinCondition(newState)
        return newState
      }

      return prevState
    })
  }, [])

  return {
    gameState,
    newGame,
    moveCard
  }
}