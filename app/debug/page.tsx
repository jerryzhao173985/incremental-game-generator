"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Trash2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { safeParse } from "@/lib/utils/storage-utils"
import { getAllGamesFromStorage, clearAllGamesFromStorage } from "@/lib/game-storage"

export default function DebugPage() {
  const [storageData, setStorageData] = useState<Record<string, any>>({})
  const [games, setGames] = useState<any[]>([])
  const [isClearing, setIsClearing] = useState(false)

  // Load storage data
  const loadStorageData = () => {
    if (typeof window === "undefined") return

    try {
      const data: Record<string, any> = {}

      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key)
          if (value) {
            // Try to parse JSON values
            if (value.startsWith("{") || value.startsWith("[")) {
              data[key] = safeParse(value, value)
            } else {
              data[key] = value
            }
          }
        }
      }

      setStorageData(data)

      // Load games
      const allGames = getAllGamesFromStorage()
      setGames(allGames)
    } catch (error) {
      console.error("Error loading storage data:", error)
    }
  }

  // Clear all game data
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all game data? This cannot be undone.")) {
      setIsClearing(true)

      try {
        clearAllGamesFromStorage()
        loadStorageData() // Reload data
      } catch (error) {
        console.error("Error clearing game data:", error)
      } finally {
        setIsClearing(false)
      }
    }
  }

  // Load data on mount
  useEffect(() => {
    loadStorageData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Storage Debug</h1>
          <Link href="/" passHref>
            <Button variant="outline" className="border-purple-500/50 hover:bg-purple-700/30 text-white">
              <Home className="h-4 w-4 mr-2" />
              Back to Generator
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Local Storage Data</h2>
          <div className="flex gap-2">
            <Button onClick={loadStorageData} variant="outline" className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleClearAll} variant="destructive" className="flex items-center" disabled={isClearing}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Game Data
            </Button>
          </div>
        </div>

        {/* Games List */}
        <h3 className="text-lg font-semibold mb-3">Stored Games ({games.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {games.length > 0 ? (
            games.map((game, index) => (
              <Card key={game.id || index} className="overflow-hidden">
                <CardHeader className="bg-gray-50 p-4">
                  <CardTitle className="text-md">{game.title || `Game ${index + 1}`}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-500 mb-2">ID: {game.id || "No ID"}</div>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{game.description || "No description"}</p>
                  <div className="flex justify-end">
                    <Link href={`/game/${encodeURIComponent(game.id)}`} passHref>
                      <Button size="sm">Open Game</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No games found in storage</p>
            </div>
          )}
        </div>

        {/* Raw Storage Data */}
        <h3 className="text-lg font-semibold mb-3">Raw Storage Data</h3>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-auto max-h-96">
          <pre className="text-xs font-mono">{JSON.stringify(storageData, null, 2)}</pre>
        </div>
      </main>
    </div>
  )
}
