"use client"

import { useState, useEffect } from "react"
import { X, ChevronUp, ChevronDown, RefreshCw, Bug, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { runGameDiagnostics, type DiagnosticResult } from "@/lib/game-diagnostics"
import { safeParse } from "@/lib/utils/storage-utils"

interface GameDebugPanelProps {
  logs: string[]
  onClose: () => void
  onRefresh: () => void
  gameId?: string
}

export default function GameDebugPanel({ logs, onClose, onRefresh, gameId }: GameDebugPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"logs" | "diagnostics" | "localStorage">("logs")
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Run diagnostics
  const runDiagnostics = () => {
    setRefreshing(true)

    // Use setTimeout to ensure UI updates before running diagnostics
    setTimeout(() => {
      try {
        const results = runGameDiagnostics()
        setDiagnostics(results)
      } catch (error) {
        console.error("Error running diagnostics:", error)
      } finally {
        setRefreshing(false)
      }
    }, 100)
  }

  // Run diagnostics on mount
  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-200 z-50 shadow-lg border-t border-gray-700 transition-all duration-300"
      style={{
        height: expanded ? "50vh" : "40px",
        maxHeight: expanded ? "50vh" : "40px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Game Debug Panel</span>
          {gameId && <span className="ml-2 text-xs text-gray-400">Game ID: {gameId}</span>}
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-2 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content (only visible when expanded) */}
      {expanded && (
        <div className="h-[calc(100%-40px)] flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-2 text-sm ${activeTab === "logs" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("logs")}
            >
              Console Logs
            </button>
            <button
              className={`px-4 py-2 text-sm ${activeTab === "diagnostics" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("diagnostics")}
            >
              Diagnostics
            </button>
            <button
              className={`px-4 py-2 text-sm ${activeTab === "localStorage" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("localStorage")}
            >
              Local Storage
            </button>
            <div className="ml-auto px-4 py-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-gray-600 hover:bg-gray-700"
                onClick={() => {
                  runDiagnostics()
                  onRefresh()
                }}
                disabled={refreshing}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto p-4">
            {activeTab === "logs" && (
              <div className="font-mono text-xs">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="py-1 border-b border-gray-800 whitespace-pre-wrap">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No logs available.</div>
                )}
              </div>
            )}

            {activeTab === "diagnostics" && (
              <div>
                {diagnostics ? (
                  <div className="space-y-4">
                    {/* Errors and warnings */}
                    {(diagnostics.errors.length > 0 || diagnostics.warnings.length > 0) && (
                      <div className="mb-4">
                        {diagnostics.errors.length > 0 && (
                          <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-2">
                            <h3 className="text-red-400 font-medium text-sm flex items-center mb-2">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Errors
                            </h3>
                            <ul className="list-disc pl-5 text-xs space-y-1">
                              {diagnostics.errors.map((error, i) => (
                                <li key={i} className="text-red-300">
                                  {error}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {diagnostics.warnings.length > 0 && (
                          <div className="bg-yellow-900/30 border border-yellow-700 rounded p-3">
                            <h3 className="text-yellow-400 font-medium text-sm flex items-center mb-2">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Warnings
                            </h3>
                            <ul className="list-disc pl-5 text-xs space-y-1">
                              {diagnostics.warnings.map((warning, i) => (
                                <li key={i} className="text-yellow-300">
                                  {warning}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Browser info */}
                    <div className="bg-gray-800 rounded p-3">
                      <h3 className="text-white font-medium text-sm mb-2">Browser Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-400">User Agent:</div>
                        <div className="text-gray-200 truncate">{diagnostics.browserInfo.userAgent}</div>

                        <div className="text-gray-400">Platform:</div>
                        <div className="text-gray-200">{diagnostics.browserInfo.platform}</div>

                        <div className="text-gray-400">Language:</div>
                        <div className="text-gray-200">{diagnostics.browserInfo.language}</div>

                        <div className="text-gray-400">Cookies Enabled:</div>
                        <div className="text-gray-200">{diagnostics.browserInfo.cookiesEnabled ? "Yes" : "No"}</div>

                        <div className="text-gray-400">LocalStorage:</div>
                        <div className="text-gray-200">
                          {diagnostics.browserInfo.localStorage ? "Available" : "Not Available"}
                        </div>

                        <div className="text-gray-400">WebGL:</div>
                        <div className="text-gray-200">
                          {diagnostics.browserInfo.webGL ? "Supported" : "Not Supported"}
                        </div>

                        <div className="text-gray-400">WebGL2:</div>
                        <div className="text-gray-200">
                          {diagnostics.browserInfo.webGL2 ? "Supported" : "Not Supported"}
                        </div>

                        <div className="text-gray-400">Screen Size:</div>
                        <div className="text-gray-200">
                          {diagnostics.browserInfo.screenSize.width} x {diagnostics.browserInfo.screenSize.height}
                        </div>

                        <div className="text-gray-400">Window Size:</div>
                        <div className="text-gray-200">
                          {diagnostics.browserInfo.windowSize.width} x {diagnostics.browserInfo.windowSize.height}
                        </div>
                      </div>
                    </div>

                    {/* THREE.js info */}
                    <div className="bg-gray-800 rounded p-3">
                      <h3 className="text-white font-medium text-sm mb-2">THREE.js Information</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-400">Available:</div>
                        <div className="text-gray-200">{diagnostics.threeJs.available ? "Yes" : "No"}</div>

                        {diagnostics.threeJs.version && (
                          <>
                            <div className="text-gray-400">Version:</div>
                            <div className="text-gray-200">{diagnostics.threeJs.version}</div>
                          </>
                        )}

                        {diagnostics.threeJs.renderer && (
                          <>
                            <div className="text-gray-400">Renderer:</div>
                            <div className="text-gray-200">{diagnostics.threeJs.renderer}</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* DOM info */}
                    <div className="bg-gray-800 rounded p-3">
                      <h3 className="text-white font-medium text-sm mb-2">Game Container</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-400">Container Found:</div>
                        <div className="text-gray-200">{diagnostics.domInfo.gameContainer ? "Yes" : "No"}</div>

                        <div className="text-gray-400">Container Size:</div>
                        <div className="text-gray-200">
                          {diagnostics.domInfo.containerSize.width} x {diagnostics.domInfo.containerSize.height}
                        </div>

                        <div className="text-gray-400">Container Visible:</div>
                        <div className="text-gray-200">{diagnostics.domInfo.containerVisible ? "Yes" : "No"}</div>

                        <div className="text-gray-400">Z-Index:</div>
                        <div className="text-gray-200">{diagnostics.domInfo.containerZIndex || "Not set"}</div>

                        <div className="text-gray-400">Position:</div>
                        <div className="text-gray-200">{diagnostics.domInfo.containerPosition || "Not set"}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "localStorage" && (
              <div>
                {diagnostics ? (
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded p-3">
                      <h3 className="text-white font-medium text-sm mb-2">LocalStorage Overview</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-400">Available:</div>
                        <div className="text-gray-200">{diagnostics.localStorage.available ? "Yes" : "No"}</div>

                        <div className="text-gray-400">Total Size:</div>
                        <div className="text-gray-200">{(diagnostics.localStorage.size / 1024).toFixed(2)} KB</div>

                        <div className="text-gray-400">Total Keys:</div>
                        <div className="text-gray-200">{diagnostics.localStorage.keys.length}</div>

                        <div className="text-gray-400">Game-related Keys:</div>
                        <div className="text-gray-200">{diagnostics.localStorage.gameKeys.length}</div>
                      </div>
                    </div>

                    {/* Game-related keys */}
                    {diagnostics.localStorage.gameKeys.length > 0 && (
                      <div className="bg-gray-800 rounded p-3">
                        <h3 className="text-white font-medium text-sm mb-2">Game-related Storage</h3>
                        <div className="space-y-2">
                          {diagnostics.localStorage.gameKeys.map((key) => {
                            const value = localStorage.getItem(key) || ""
                            const isJson = value.startsWith("{") || value.startsWith("[")
                            const formattedValue = isJson ? JSON.stringify(safeParse(value, {}), null, 2) : value

                            return (
                              <div key={key} className="border border-gray-700 rounded p-2">
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-purple-400 font-mono text-xs">{key}</span>
                                  <span className="text-gray-500 text-xs">
                                    {(key.length + value.length).toLocaleString()} bytes
                                  </span>
                                </div>
                                <div className="text-xs font-mono bg-gray-900 p-2 rounded max-h-32 overflow-auto">
                                  <pre className="whitespace-pre-wrap break-all">{formattedValue}</pre>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Other keys */}
                    {diagnostics.localStorage.keys.length > diagnostics.localStorage.gameKeys.length && (
                      <div className="bg-gray-800 rounded p-3">
                        <h3 className="text-white font-medium text-sm mb-2">Other Storage Keys</h3>
                        <div className="text-xs font-mono">
                          {diagnostics.localStorage.keys
                            .filter((key) => !diagnostics.localStorage.gameKeys.includes(key))
                            .map((key) => (
                              <div key={key} className="py-1 border-b border-gray-700">
                                {key}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
