import { describe, it, expect } from 'vitest'
import { compressGameData, decompressGameData } from './game-utils'
import type { GameStageData } from '@/components/game-generator'

const sampleGame: GameStageData = {
  id: 'game-1',
  title: 'Test',
  description: 'Test game',
  html: '<div></div>',
  css: '',
  js: '',
  md: '# Test markdown'
}

describe('game data compression', () => {
  it('compresses and decompresses game data', () => {
    const compressed = compressGameData(sampleGame)
    const result = decompressGameData(compressed)
    expect(result).toEqual(sampleGame)
  })
})
