import type { GameStageData } from "@/components/game-generator"
import { getStorageItem, setStorageItem } from "./storage"

// Get all games from localStorage
export function getAllGames(): GameStageData[] {
  return getStorageItem<GameStageData[]>("generatedGames", [])
}

// Get a specific game by ID
export function getGameById(id: string): GameStageData | null {
  const games = getAllGames()
  return games.find((game) => game.id === id) || null
}

// Save a game to localStorage
export function saveGame(game: GameStageData): boolean {
  // Ensure the game has an ID
  if (!game.id) {
    game.id = `game-${Date.now()}`
  }

  const games = getAllGames()

  // Check if the game already exists
  const existingIndex = games.findIndex((g) => g.id === game.id)

  if (existingIndex >= 0) {
    // Update existing game
    games[existingIndex] = game
  } else {
    // Add new game
    games.push(game)
  }

  return setStorageItem("generatedGames", games)
}

// Save multiple games to localStorage
export function saveGames(games: GameStageData[]): boolean {
  // Ensure all games have IDs
  const gamesWithIds = games.map((game) => {
    if (!game.id) {
      return { ...game, id: `game-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` }
    }
    return game
  })

  try {
    // Try to save all games at once
    const success = setStorageItem("generatedGames", gamesWithIds)

    if (!success) {
      console.warn("Failed to save all games at once, trying chunked approach")

      // If that fails, try to save each game individually (in case of localStorage size limits)
      let allSuccess = true
      for (const game of gamesWithIds) {
        const individualSuccess = saveGame(game)
        if (!individualSuccess) {
          allSuccess = false
        }
      }

      return allSuccess
    }

    return success
  } catch (error) {
    console.error("Error saving games:", error)
    return false
  }
}

// Delete a game by ID
export function deleteGame(id: string): boolean {
  const games = getAllGames()
  const filteredGames = games.filter((game) => game.id !== id)

  if (filteredGames.length === games.length) {
    // Game not found
    return false
  }

  return setStorageItem("generatedGames", filteredGames)
}

// Compress game data for URL transfer
export function compressGameData(game: GameStageData): string {
  try {
    // Create a minimal version with just the essential data
    const minimalGame = {
      id: game.id,
      title: game.title,
      description: game.description,
      html: game.html,
      css: game.css,
      js: game.js,
      // Only include md if it's not too large
      md: game.md && game.md.length < 10000 ? game.md : undefined,
    }

    const gameDataStr = JSON.stringify(minimalGame)
    return btoa(encodeURIComponent(gameDataStr))
  } catch (error) {
    console.error("Error compressing game data:", error)
    throw new Error("Failed to compress game data")
  }
}

// Decompress game data from URL
export function decompressGameData(compressedData: string): GameStageData {
  try {
    const decodedData = decodeURIComponent(atob(compressedData))
    return JSON.parse(decodedData) as GameStageData
  } catch (error) {
    console.error("Error decompressing game data:", error)
    throw new Error("Failed to decompress game data")
  }
}
