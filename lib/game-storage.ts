/**
 * Utility for game storage operations
 */
import { safeGetItem, safeSetItem, safeRemoveItem, safeParse } from "./utils/storage-utils"

// Define game data interface
export interface GameData {
  id: string
  title: string
  html: string
  css: string
  js: string
  description?: string
  md?: string
  [key: string]: any
}

/**
 * Saves a game to localStorage with multiple redundant methods
 */
export function saveGameToStorage(game: GameData): boolean {
  if (!game || !game.id) {
    console.error("Cannot save game: Invalid game data or missing ID")
    return false
  }

  try {
    // Method 1: Save to dedicated key for this specific game
    safeSetItem(`game-${game.id}`, JSON.stringify(game))

    // Method 2: Update the games array
    try {
      const gamesJson = safeGetItem("generatedGames")
      const games: GameData[] = safeParse(gamesJson, [])

      // Find and update existing game or add new one
      const existingIndex = games.findIndex((g: GameData) => g.id === game.id)
      if (existingIndex >= 0) {
        games[existingIndex] = game
      } else {
        games.push(game)
      }

      safeSetItem("generatedGames", JSON.stringify(games))
    } catch (err) {
      console.warn("Error updating games array:", err)
    }

    // Method 3: Save as latest game
    safeSetItem("latestGame", JSON.stringify(game))
    safeSetItem("latestGameId", game.id)

    // Method 4: Save minimal version as backup
    try {
      const minimalGame = {
        id: game.id,
        title: game.title,
        html: game.html,
        css: game.css,
        js: game.js,
      }
      safeSetItem("minimalLatestGame", JSON.stringify(minimalGame))
    } catch (err) {
      console.warn("Error saving minimal game:", err)
    }

    // Add timestamp for debugging
    safeSetItem("lastGameSaveTime", new Date().toISOString())

    return true
  } catch (err) {
    console.error("Error saving game to storage:", err)
    return false
  }
}

/**
 * Gets a game from localStorage using multiple fallback methods
 */
export function getGameFromStorage(gameId: string): GameData | null {
  if (!gameId) {
    console.error("Cannot get game: Missing game ID")
    return null
  }

  try {
    // Method 1: Try dedicated key for this specific game
    const gameJson = safeGetItem(`game-${gameId}`)
    if (gameJson) {
      return safeParse(gameJson, null)
    }

    // Method 2: Check in games array
    const gamesJson = safeGetItem("generatedGames")
    if (gamesJson) {
      const games = safeParse<GameData[]>(gamesJson, [])
      if (Array.isArray(games)) {
        const game = games.find((g: GameData) => g.id === gameId)
        if (game) {
          return game
        }
      }
    }

    // Method 3: Check if it's the latest game
    const latestGameId = safeGetItem("latestGameId")
    if (latestGameId === gameId) {
      const latestGameJson = safeGetItem("latestGame")
      if (latestGameJson) {
        return safeParse(latestGameJson, null)
      }
    }

    // Method 4: Check minimal version
    const minimalGameJson = safeGetItem("minimalLatestGame")
    if (minimalGameJson) {
      const minimalGame = safeParse<GameData>(minimalGameJson, null)
      if (minimalGame && minimalGame.id === gameId) {
        return minimalGame
      }
    }

    // Game not found
    return null
  } catch (err) {
    console.error("Error getting game from storage:", err)
    return null
  }
}

/**
 * Gets all games from localStorage
 */
export function getAllGamesFromStorage(): GameData[] {
  try {
    const gamesJson = safeGetItem("generatedGames")
    return safeParse<GameData[]>(gamesJson, [])
  } catch (err) {
    console.error("Error getting all games from storage:", err)
    return []
  }
}

/**
 * Deletes a game from localStorage
 */
export function deleteGameFromStorage(gameId: string): boolean {
  if (!gameId) {
    console.error("Cannot delete game: Missing game ID")
    return false
  }

  try {
    // Remove dedicated key
    safeRemoveItem(`game-${gameId}`)

    // Update games array
    const gamesJson = safeGetItem("generatedGames")
    if (gamesJson) {
      let games = safeParse<GameData[]>(gamesJson, [])
      if (Array.isArray(games)) {
        games = games.filter((g: GameData) => g.id !== gameId)
        safeSetItem("generatedGames", JSON.stringify(games))
      }
    }

    // Clear latest game if it matches
    const latestGameId = safeGetItem("latestGameId")
    if (latestGameId === gameId) {
      safeRemoveItem("latestGame")
      safeRemoveItem("latestGameId")
    }

    // Clear minimal game if it matches
    const minimalGameJson = safeGetItem("minimalLatestGame")
    if (minimalGameJson) {
      const minimalGame = safeParse<GameData>(minimalGameJson, null)
      if (minimalGame && minimalGame.id === gameId) {
        safeRemoveItem("minimalLatestGame")
      }
    }

    return true
  } catch (err) {
    console.error("Error deleting game from storage:", err)
    return false
  }
}

/**
 * Clears all game data from localStorage
 */
export function clearAllGamesFromStorage(): boolean {
  try {
    // Get all keys
    const keys = Object.keys(localStorage)

    // Remove game-specific keys
    for (const key of keys) {
      if (
        key.startsWith("game-") ||
        key === "generatedGames" ||
        key === "latestGame" ||
        key === "latestGameId" ||
        key === "minimalLatestGame" ||
        key === "lastGameSaveTime"
      ) {
        safeRemoveItem(key)
      }
    }

    return true
  } catch (err) {
    console.error("Error clearing all games from storage:", err)
    return false
  }
}
