'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { GameState, Card } from '@/types/game'
import { 
  initializeGame, 
  isValidTableauMove, 
  isValidFoundationMove, 
  checkWinCondition,
  canMoveSequence,
  canAutoComplete,
  getNextAutoCompleteMove,
  createTestAutoCompleteGame
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
  const [isAutoCompleting, setIsAutoCompleting] = useState(false)
  const [autoCompleteHighlight, setAutoCompleteHighlight] = useState<{
    source?: {type: 'freecell' | 'tableau', index: number}
    destination?: {type: 'foundation', index: number}
  }>({});
  const gameStartTime = useRef<number>(Date.now())
  const previousWonState = useRef<boolean>(false)
  const gameHasStarted = useRef<boolean>(false)
  const autoCompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  const performAutoComplete = useCallback(() => {
    const executeNextMove = () => {
      setGameState(prevState => {
        const nextMove = getNextAutoCompleteMove(prevState)
        if (!nextMove) {
          setIsAutoCompleting(false)
          setAutoCompleteHighlight({})
          return prevState
        }

        // First highlight the source card
        setAutoCompleteHighlight({
          source: {
            type: nextMove.from.type,
            index: nextMove.from.index
          }
        })
        
        // After a delay, also highlight the destination
        setTimeout(() => {
          setAutoCompleteHighlight({
            source: {
              type: nextMove.from.type,
              index: nextMove.from.index
            },
            destination: {
              type: 'foundation',
              index: nextMove.foundationIndex
            }
          })
        }, 400)

        const newState = { ...prevState }
        
        // Move card from source to foundation
        if (nextMove.from.type === 'freecell') {
          const card = newState.freeCells[nextMove.from.index]
          if (card) {
            newState.freeCells[nextMove.from.index] = null
            newState.foundations[nextMove.foundationIndex].push(card)
          }
        } else if (nextMove.from.type === 'tableau') {
          const column = newState.tableau[nextMove.from.index]
          if (column.length > 0) {
            const card = column.pop()
            if (card) {
              newState.foundations[nextMove.foundationIndex].push(card)
            }
          }
        }

        newState.moves++
        newState.isWon = checkWinCondition(newState)

        // Clear highlight after a delay, then schedule next move
        setTimeout(() => setAutoCompleteHighlight({}), 600)
        
        // Schedule next move if not won yet
        if (!newState.isWon && canAutoComplete(newState)) {
          autoCompleteTimeoutRef.current = setTimeout(executeNextMove, 1200) // Even slower for visibility
        } else {
          setIsAutoCompleting(false)
          setAutoCompleteHighlight({})
        }

        return newState
      })
    }

    // Start the auto-completion sequence
    autoCompleteTimeoutRef.current = setTimeout(executeNextMove, 1500) // Even longer initial delay for dramatic effect
  }, [])

  // Auto-completion effect
  useEffect(() => {
    if (!gameState.isWon && !isAutoCompleting && canAutoComplete(gameState)) {
      setIsAutoCompleting(true)
      performAutoComplete()
    }
  }, [gameState, isAutoCompleting, performAutoComplete])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoCompleteTimeoutRef.current) {
        clearTimeout(autoCompleteTimeoutRef.current)
      }
    }
  }, [])

  const newGame = useCallback(() => {
    // Clear any ongoing auto-completion
    if (autoCompleteTimeoutRef.current) {
      clearTimeout(autoCompleteTimeoutRef.current)
      autoCompleteTimeoutRef.current = null
    }
    setIsAutoCompleting(false)
    setAutoCompleteHighlight({})

    // Record abandoned game if the previous game was started but not won
    if (gameHasStarted.current && !gameState.isWon && session?.user) {
      const timeSeconds = Math.floor((Date.now() - gameStartTime.current) / 1000)
      recordGameCompletion(gameState.moves, timeSeconds, false)
    }

    // Start new game
    setGameState(initializeGame())
    gameStartTime.current = Date.now()
    previousWonState.current = false
    gameHasStarted.current = false
  }, [gameState.isWon, gameState.moves, session?.user])

  const setTestGame = useCallback(() => {
    // Clear any ongoing auto-completion
    if (autoCompleteTimeoutRef.current) {
      clearTimeout(autoCompleteTimeoutRef.current)
      autoCompleteTimeoutRef.current = null
    }
    setIsAutoCompleting(false)
    setAutoCompleteHighlight({})

    // Set up test game state
    setGameState(createTestAutoCompleteGame())
    gameStartTime.current = Date.now()
    previousWonState.current = false
    gameHasStarted.current = true // Mark as started since we have moves to make
  }, [])

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
    moveCard,
    isAutoCompleting,
    setTestGame,
    autoCompleteHighlight
  }
}