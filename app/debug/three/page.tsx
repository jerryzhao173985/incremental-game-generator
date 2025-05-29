"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { loadThreeJs, createThreeMock } from "@/lib/game-loader"
import { Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function ThreeDebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [threeJsStatus, setThreeJsStatus] = useState<"loading" | "loaded" | "error" | "not-started">("not-started")
  const [threeJsInfo, setThreeJsInfo] = useState<any>(null)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
    console.log(message)
  }

  const loadThreeJsLibrary = async () => {
    setThreeJsStatus("loading")
    addLog("Starting THREE.js load test...")

    try {
      await loadThreeJs()
      setThreeJsStatus("loaded")
      addLog("THREE.js loaded successfully")

      // Get THREE.js info
      if (typeof window !== "undefined" && (window as any).THREE) {
        const THREE = (window as any).THREE
        setThreeJsInfo({
          version: THREE.REVISION || "unknown",
          isMock: false,
        })
        addLog(`THREE.js version: ${THREE.REVISION || "unknown"}`)
      }
    } catch (error) {
      setThreeJsStatus("error")
      addLog(`Error loading THREE.js: ${error instanceof Error ? error.message : String(error)}`)

      // Create mock
      addLog("Creating THREE.js mock...")
      const mockThree = createThreeMock()
      if (mockThree) {
        addLog("THREE.js mock created successfully")
        setThreeJsInfo({
          version: "mock",
          isMock: true,
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-900 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">THREE.js Debug</h1>
          <Link href="/" passHref>
            <Button variant="outline" className="border-purple-500/50 hover:bg-purple-700/30 text-white">
              <Home className="h-4 w-4 mr-2" />
              Back to Generator
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>THREE.js Loader Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button onClick={loadThreeJsLibrary} disabled={threeJsStatus === "loading"}>
                {threeJsStatus === "loading" ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load THREE.js"
                )}
              </Button>
            </div>

            {threeJsStatus !== "not-started" && (
              <div
                className={`p-4 rounded-md ${
                  threeJsStatus === "loaded"
                    ? "bg-green-50 text-green-700"
                    : threeJsStatus === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-yellow-50 text-yellow-700"
                }`}
              >
                <h3 className="font-medium mb-2">Status: {threeJsStatus.toUpperCase()}</h3>

                {threeJsInfo && (
                  <div className="mb-2">
                    <p>Version: {threeJsInfo.version}</p>
                    <p>Type: {threeJsInfo.isMock ? "Mock (Fallback)" : "Real Library"}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-200 p-4 rounded-lg h-[300px] overflow-auto font-mono text-sm">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="py-1 border-b border-gray-800">
                    {log}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No logs available. Click "Load THREE.js" to start the test.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
