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
 * Check if the game can be auto-completed using proper chain simulation
 */
export function canAutoComplete(gameState: GameState): boolean {
  console.log('🔍 canAutoComplete: Starting CHAIN simulation...')
  
  // Clone the game state for simulation
  const simulatedState = JSON.parse(JSON.stringify(gameState)) as GameState
  let moved = true
  let iterations = 0
  
  while (moved && iterations < 52) { // Safety limit
    moved = false
    iterations++
    
    console.log(`🔄 canAutoComplete: Iteration ${iterations}`)
    
    // Get current frontier (all accessible cards)
    const frontierCards = getMovableCards(simulatedState)
    console.log(`📋 canAutoComplete: Frontier has ${frontierCards.length} cards:`, 
      frontierCards.map(c => `${c.card.rank}${c.card.suit}`))
    
    // Find ANY card that can advance its foundation (exact next rank)
    for (const cardInfo of frontierCards) {
      const foundationIndex = ['hearts', 'diamonds', 'clubs', 'spades'].indexOf(cardInfo.card.suit)
      const foundation = simulatedState.foundations[foundationIndex]
      const cardRank = getRankValue(cardInfo.card.rank)
      const expectedRank = foundation.length === 0 ? 1 : getRankValue(foundation[foundation.length - 1].rank) + 1
      
      const canMove = cardRank === expectedRank
      console.log(`🃏 canAutoComplete: ${cardInfo.card.rank}${cardInfo.card.suit} - rank ${cardRank}, expected ${expectedRank}, can move: ${canMove}`)
      
      if (canMove) {
        // Move the card to foundation
        simulatedState.foundations[foundationIndex].push(cardInfo.card)
        
        // Remove from source (this will expose new cards)
        if (cardInfo.source.type === 'freecell') {
          simulatedState.freeCells[cardInfo.source.index] = null
        } else if (cardInfo.source.type === 'tableau') {
          simulatedState.tableau[cardInfo.source.index].pop()
        }
        
        console.log(`✅ canAutoComplete: Moved ${cardInfo.card.rank}${cardInfo.card.suit} to foundation, exposing new cards`)
        moved = true
        break // Restart with new frontier
      }
    }
  }
  
  // Check if simulation completed the game
  const remainingCards = getRemainingCards(simulatedState)
  const canComplete = remainingCards.length === 0
  
  console.log(`🏁 canAutoComplete: CHAIN simulation result - ${canComplete ? 'CAN' : 'CANNOT'} auto-complete`)
  console.log(`📊 canAutoComplete: ${remainingCards.length} cards remaining after chain simulation`)
  
  return canComplete
}

/**
 * Get all cards that can currently be moved (top of tableau columns + freecells)
 */
function getMovableCards(gameState: GameState): Array<{card: Card, source: {type: 'freecell' | 'tableau', index: number}}> {
  const movableCards: Array<{card: Card, source: {type: 'freecell' | 'tableau', index: number}}> = []
  
  // Add freecell cards
  gameState.freeCells.forEach((card, index) => {
    if (card) {
      movableCards.push({
        card,
        source: { type: 'freecell', index }
      })
    }
  })
  
  // Add top cards from tableau columns
  gameState.tableau.forEach((column, index) => {
    if (column.length > 0) {
      movableCards.push({
        card: column[column.length - 1],
        source: { type: 'tableau', index }
      })
    }
  })
  
  return movableCards
}

/**
 * Check if a card can move to foundation (exact next rank only)
 */
function isSafeToMoveToFoundation(card: Card, gameState: GameState): boolean {
  const foundationIndex = ['hearts', 'diamonds', 'clubs', 'spades'].indexOf(card.suit)
  const foundation = gameState.foundations[foundationIndex]
  const cardRank = getRankValue(card.rank)
  const expectedRank = foundation.length === 0 ? 1 : getRankValue(foundation[foundation.length - 1].rank) + 1
  
  console.log(`  🔸 ${card.rank}${card.suit} (rank ${cardRank}) vs expected rank ${expectedRank} for ${card.suit}`)
  
  return cardRank === expectedRank
}

/**
 * Get all cards not yet in foundations
 */
function getRemainingCards(gameState: GameState): Card[] {
  const remainingCards: Card[] = []
  
  // Add freecell cards
  gameState.freeCells.forEach(card => {
    if (card) remainingCards.push(card)
  })
  
  // Add tableau cards
  gameState.tableau.forEach(column => {
    remainingCards.push(...column)
  })
  
  return remainingCards
}

/**
 * Convert rank value back to string
 */
function getStringFromRankValue(value: number): Rank {
  const rankMap: Record<number, Rank> = {
    1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
    8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K'
  }
  return rankMap[value]
}

/**
 * Get the next card that should be moved to foundations for auto-completion
 */
export function getNextAutoCompleteMove(gameState: GameState): { from: { type: 'freecell' | 'tableau', index: number, cardIndex?: number }, foundationIndex: number } | null {
  console.log('🎯 getNextAutoCompleteMove: Looking for next move...')
  
  // Get all movable cards and find the first one that's safe to move
  const movableCards = getMovableCards(gameState)
  console.log(`🎯 getNextAutoCompleteMove: Found ${movableCards.length} movable cards`)
  
  for (const cardInfo of movableCards) {
    const isSafe = isSafeToMoveToFoundation(cardInfo.card, gameState)
    console.log(`🎯 getNextAutoCompleteMove: ${cardInfo.card.rank}${cardInfo.card.suit} is ${isSafe ? 'SAFE' : 'NOT SAFE'} to move`)
    
    if (isSafe) {
      const foundationIndex = ['hearts', 'diamonds', 'clubs', 'spades'].indexOf(cardInfo.card.suit)
      const move = {
        from: {
          type: cardInfo.source.type,
          index: cardInfo.source.index,
          cardIndex: cardInfo.source.type === 'tableau' ? gameState.tableau[cardInfo.source.index].length - 1 : undefined
        },
        foundationIndex
      }
      console.log(`🎯 getNextAutoCompleteMove: Returning move:`, move)
      return move
    }
  }
  
  console.log('🎯 getNextAutoCompleteMove: No safe moves found')
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