import { Card, Suit, Rank, GameState } from '@/types/game'

export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  const deck: Card[] = []

  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
      })
    })
  })

  return shuffleDeck(deck)
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function initializeGame(): GameState {
  const deck = createDeck()
  const tableau: Card[][] = [[], [], [], [], [], [], [], []]
  
  let cardIndex = 0
  for (let col = 0; col < 8; col++) {
    const cardsInColumn = col < 4 ? 7 : 6
    for (let row = 0; row < cardsInColumn; row++) {
      tableau[col].push(deck[cardIndex])
      cardIndex++
    }
  }

  return {
    freeCells: [null, null, null, null],
    foundations: [[], [], [], []],
    tableau,
    isWon: false,
    moves: 0,
    startTime: Date.now()
  }
}

export function getRankValue(rank: Rank): number {
  const rankValues: Record<Rank, number> = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
  }
  return rankValues[rank]
}

export function isValidTableauMove(card: Card, targetCard: Card | null): boolean {
  if (!targetCard) return true
  
  const cardValue = getRankValue(card.rank)
  const targetValue = getRankValue(targetCard.rank)
  
  return cardValue === targetValue - 1 && card.color !== targetCard.color
}

export function isValidFoundationMove(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) {
    return card.rank === 'A'
  }
  
  const topCard = foundation[foundation.length - 1]
  const cardValue = getRankValue(card.rank)
  const topValue = getRankValue(topCard.rank)
  
  return card.suit === topCard.suit && cardValue === topValue + 1
}

export function checkWinCondition(gameState: GameState): boolean {
  return gameState.foundations.every(foundation => foundation.length === 13)
}

export function canMoveSequence(tableau: Card[][], fromCol: number, cardIndex: number): boolean {
  const column = tableau[fromCol]
  if (cardIndex >= column.length) return false
  
  for (let i = cardIndex; i < column.length - 1; i++) {
    const currentCard = column[i]
    const nextCard = column[i + 1]
    
    if (!isValidTableauMove(nextCard, currentCard)) {
      return false
    }
  }
  
  return true
}

export function getMaxMovableSequence(gameState: GameState): number {
  const { freeCells, tableau } = gameState
  const emptyFreeCells = freeCells.filter(cell => cell === null).length
  const emptyColumns = tableau.filter(col => col.length === 0).length
  
  return Math.pow(2, emptyFreeCells) * (emptyColumns + 1)
}

/**
 * Check if the game can be auto-completed (all remaining cards can go to foundations)
 */
export function canAutoComplete(gameState: GameState): boolean {
  const { freeCells, tableau } = gameState
  
  // Get all cards that aren't in foundations yet
  const remainingCards: Card[] = []
  
  // Add cards from freecells
  freeCells.forEach(card => {
    if (card) remainingCards.push(card)
  })
  
  // Add ALL cards from tableau columns, not just top cards
  tableau.forEach(column => {
    remainingCards.push(...column)
  })
  
  // If no remaining cards, it's already won
  if (remainingCards.length === 0) return false
  
  // More lenient check: auto-complete is possible if:
  // 1. We have relatively few cards left (20 or fewer for earlier triggering)
  // 2. All tableau columns are properly sequenced (descending, alternating colors)
  // 3. All cards can eventually be placed on foundations
  
  const hasProperTableauSequences = tableau.every(column => {
    // Empty columns are fine
    if (column.length === 0) return true
    
    // Check if column is in proper descending sequence
    for (let i = 0; i < column.length - 1; i++) {
      const current = column[i]
      const next = column[i + 1]
      const currentValue = getRankValue(current.rank)
      const nextValue = getRankValue(next.rank)
      
      // Must be descending by 1 and alternating colors
      if (currentValue !== nextValue + 1 || current.color === next.color) {
        return false
      }
    }
    return true
  })
  
  // Check that there's at least one card that can be moved to foundations right now
  const hasImmediateMove = getNextAutoCompleteMove(gameState) !== null
  
  // More generous threshold - trigger when 20 or fewer cards remain
  const fewCardsRemaining = remainingCards.length <= 20
  
  return hasProperTableauSequences && hasImmediateMove && fewCardsRemaining
}

/**
 * Get the next card that should be moved to foundations for auto-completion
 */
export function getNextAutoCompleteMove(gameState: GameState): { from: { type: 'freecell' | 'tableau', index: number, cardIndex?: number }, foundationIndex: number } | null {
  const { freeCells, tableau, foundations } = gameState
  
  // Check freecells first (easier moves)
  for (let i = 0; i < freeCells.length; i++) {
    const card = freeCells[i]
    if (card) {
      const foundationIndex = ['hearts', 'diamonds', 'clubs', 'spades'].indexOf(card.suit)
      if (isValidFoundationMove(card, foundations[foundationIndex])) {
        return {
          from: { type: 'freecell', index: i },
          foundationIndex
        }
      }
    }
  }
  
  // Check top cards of tableau columns
  for (let i = 0; i < tableau.length; i++) {
    const column = tableau[i]
    if (column.length > 0) {
      const topCard = column[column.length - 1]
      const foundationIndex = ['hearts', 'diamonds', 'clubs', 'spades'].indexOf(topCard.suit)
      if (isValidFoundationMove(topCard, foundations[foundationIndex])) {
        return {
          from: { type: 'tableau', index: i, cardIndex: column.length - 1 },
          foundationIndex
        }
      }
    }
  }
  
  return null
}

/**
 * Create a test game state that's almost complete for testing auto-completion
 */
export function createTestAutoCompleteGame(): GameState {
  // Create foundations with most cards already placed
  const foundations: Card[][] = [
    // Hearts: A through Q (missing K)
    [
      { id: 'hearts-A', suit: 'hearts', rank: 'A', color: 'red' },
      { id: 'hearts-2', suit: 'hearts', rank: '2', color: 'red' },
      { id: 'hearts-3', suit: 'hearts', rank: '3', color: 'red' },
      { id: 'hearts-4', suit: 'hearts', rank: '4', color: 'red' },
      { id: 'hearts-5', suit: 'hearts', rank: '5', color: 'red' },
      { id: 'hearts-6', suit: 'hearts', rank: '6', color: 'red' },
      { id: 'hearts-7', suit: 'hearts', rank: '7', color: 'red' },
      { id: 'hearts-8', suit: 'hearts', rank: '8', color: 'red' },
      { id: 'hearts-9', suit: 'hearts', rank: '9', color: 'red' },
      { id: 'hearts-10', suit: 'hearts', rank: '10', color: 'red' },
      { id: 'hearts-J', suit: 'hearts', rank: 'J', color: 'red' },
      { id: 'hearts-Q', suit: 'hearts', rank: 'Q', color: 'red' },
    ],
    // Diamonds: A through J (missing Q, K)
    [
      { id: 'diamonds-A', suit: 'diamonds', rank: 'A', color: 'red' },
      { id: 'diamonds-2', suit: 'diamonds', rank: '2', color: 'red' },
      { id: 'diamonds-3', suit: 'diamonds', rank: '3', color: 'red' },
      { id: 'diamonds-4', suit: 'diamonds', rank: '4', color: 'red' },
      { id: 'diamonds-5', suit: 'diamonds', rank: '5', color: 'red' },
      { id: 'diamonds-6', suit: 'diamonds', rank: '6', color: 'red' },
      { id: 'diamonds-7', suit: 'diamonds', rank: '7', color: 'red' },
      { id: 'diamonds-8', suit: 'diamonds', rank: '8', color: 'red' },
      { id: 'diamonds-9', suit: 'diamonds', rank: '9', color: 'red' },
      { id: 'diamonds-10', suit: 'diamonds', rank: '10', color: 'red' },
      { id: 'diamonds-J', suit: 'diamonds', rank: 'J', color: 'red' },
    ],
    // Clubs: A through 10 (missing J, Q, K)
    [
      { id: 'clubs-A', suit: 'clubs', rank: 'A', color: 'black' },
      { id: 'clubs-2', suit: 'clubs', rank: '2', color: 'black' },
      { id: 'clubs-3', suit: 'clubs', rank: '3', color: 'black' },
      { id: 'clubs-4', suit: 'clubs', rank: '4', color: 'black' },
      { id: 'clubs-5', suit: 'clubs', rank: '5', color: 'black' },
      { id: 'clubs-6', suit: 'clubs', rank: '6', color: 'black' },
      { id: 'clubs-7', suit: 'clubs', rank: '7', color: 'black' },
      { id: 'clubs-8', suit: 'clubs', rank: '8', color: 'black' },
      { id: 'clubs-9', suit: 'clubs', rank: '9', color: 'black' },
      { id: 'clubs-10', suit: 'clubs', rank: '10', color: 'black' },
    ],
    // Spades: A through 9 (missing 10, J, Q, K) 
    [
      { id: 'spades-A', suit: 'spades', rank: 'A', color: 'black' },
      { id: 'spades-2', suit: 'spades', rank: '2', color: 'black' },
      { id: 'spades-3', suit: 'spades', rank: '3', color: 'black' },
      { id: 'spades-4', suit: 'spades', rank: '4', color: 'black' },
      { id: 'spades-5', suit: 'spades', rank: '5', color: 'black' },
      { id: 'spades-6', suit: 'spades', rank: '6', color: 'black' },
      { id: 'spades-7', suit: 'spades', rank: '7', color: 'black' },
      { id: 'spades-8', suit: 'spades', rank: '8', color: 'black' },
      { id: 'spades-9', suit: 'spades', rank: '9', color: 'black' },
    ]
  ]

  // Place remaining cards in tableau and freecells for auto-completion
  // Setup requires strategic move: King is blocking cards that can go to foundations
  const tableau: Card[][] = [
    [
      { id: 'spades-10', suit: 'spades', rank: '10', color: 'black' }, // Can go to spades foundation
      { id: 'hearts-K', suit: 'hearts', rank: 'K', color: 'red' }      // Blocking the 10 - move this to freecell!
    ],
    [{ id: 'diamonds-Q', suit: 'diamonds', rank: 'Q', color: 'red' }], // Can go to diamonds foundation
    [{ id: 'clubs-J', suit: 'clubs', rank: 'J', color: 'black' }], // Can go to clubs foundation  
    [], // Empty
    [], // Empty
    [], // Empty
    [], // Empty
    [] // Empty
  ]

  const freeCells: (Card | null)[] = [
    null, // Empty freecell - move the King here!
    { id: 'diamonds-K', suit: 'diamonds', rank: 'K', color: 'red' }, // Can go after diamonds-Q
    { id: 'clubs-Q', suit: 'clubs', rank: 'Q', color: 'black' }, // Can go after clubs-J
    { id: 'spades-J', suit: 'spades', rank: 'J', color: 'black' } // Can go after spades-10
  ]

  return {
    foundations,
    tableau,
    freeCells,
    isWon: false,
    moves: 0,
    startTime: Date.now()
  }
}