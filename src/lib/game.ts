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

export function getMaxMovableSequence(gameState: GameState, fromCol: number): number {
  const { freeCells, tableau } = gameState
  const emptyFreeCells = freeCells.filter(cell => cell === null).length
  const emptyColumns = tableau.filter(col => col.length === 0).length
  
  return Math.pow(2, emptyFreeCells) * (emptyColumns + 1)
}