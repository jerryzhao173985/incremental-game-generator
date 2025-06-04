"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { generateGameStage, fixGameCode } from "@/app/actions/generate-game"
import GameStage from "./game-stage"
import ApiKeyForm from "./api-key-form"
import PipelineDocumentation from "./pipeline-documentation"
import TemplateSelector from "./template-selector"
import { GameTemplate } from "@/lib/templates"
import { compressStages, decompressStages } from "@/lib/game-utils"
import { AlertCircle, Download, ExternalLink, Loader2, RefreshCw, Wrench } from "lucide-react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReactMarkdown from "react-markdown"
import { saveGames } from "@/lib/game-utils"

export type GameStageData = {
  title: string
  description: string
  html: string
  css: string
  js: string
  md?: string
  id?: string
}

export default function GameGenerator() {
  const [stages, setStages] = useState<GameStageData[]>([])
  const [currentStage, setCurrentStage] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [gameTheme, setGameTheme] = useState("")
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [themeInput, setThemeInput] = useState("")
  const [showThemeInput, setShowThemeInput] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showFixDialog, setShowFixDialog] = useState(false)
  const [errorDetails, setErrorDetails] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const [logs, setLogs] = useState<string[]>([])
  const finalGameIframeRef = useRef<HTMLIFrameElement>(null)
  const [isOpeningNewTab, setIsOpeningNewTab] = useState(false)
  const [totalStages, setTotalStages] = useState<number>(5)
  const [stagePlans, setStagePlans] = useState<string[]>([])
  const [feedbacks, setFeedbacks] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null)
  const [model, setModel] = useState("gpt-4o")

  // Load saved games from localStorage on component mount
  useEffect(() => {
    try {
      // Check for API key first
      const storedApiKey = localStorage.getItem("openai_api_key")
      if (storedApiKey) {
        setApiKey(storedApiKey)
      }

      const storedGames = localStorage.getItem("generatedGames")
      if (storedGames) {
        const games = JSON.parse(storedGames)
        if (Array.isArray(games) && games.length > 0) {
          // Only load the games if we don't already have stages
          if (stages.length === 0) {
            setStages(games)
            setCurrentStage(games.length)
            setGameTheme(localStorage.getItem("gameTheme") || "")
            const plan = localStorage.getItem("stagePlans")
            if (plan) setStagePlans(JSON.parse(plan))
            const fb = localStorage.getItem("stageFeedbacks")
            if (fb) setFeedbacks(JSON.parse(fb))
            const storedTotal = localStorage.getItem("totalStages")
            if (storedTotal) setTotalStages(parseInt(storedTotal))
            const modelStored = localStorage.getItem("modelChoice")
            if (modelStored) setModel(modelStored)
            const templateStored = localStorage.getItem("selectedTemplate")
            if (templateStored) setSelectedTemplate(JSON.parse(templateStored))
            setShowThemeInput(false)
            if (games.length === totalStages) {
              setIsComplete(true)
            }
          }
        } else if (storedApiKey) {
          // If we have an API key but no games, show the theme input
          setShowThemeInput(true)
        }
      } else if (storedApiKey) {
        // If we have an API key but no games, show the theme input
        setShowThemeInput(true)
      }
    } catch (error) {
      console.error("Error loading saved games:", error)
    }
  }, [])

  // Save games to localStorage whenever stages change
  useEffect(() => {
    if (stages.length > 0) {
      try {
        // Use the saveGames utility function
        const saved = saveGames(stages)
        if (saved) {
          localStorage.setItem("gameTheme", gameTheme)
        } else {
          console.error("Failed to save games to localStorage")
        }
      } catch (error) {
        console.error("Error saving games to localStorage:", error)
      }
    }
  }, [stages, gameTheme])

  const handleApiKeyValidated = (key: string) => {
    setApiKey(key)
    // Show theme input once API key is validated
    setShowThemeInput(true)
  }

  const handleStartGeneration = () => {
    if (!themeInput.trim()) {
      alert("Please enter a theme for your game")
      return
    }

    setGameTheme(themeInput)
    localStorage.setItem("totalStages", String(totalStages))
    localStorage.setItem("stagePlans", JSON.stringify(stagePlans))
    localStorage.setItem("modelChoice", model)
    if (selectedTemplate) {
      localStorage.setItem("selectedTemplate", JSON.stringify(selectedTemplate))
    } else {
      localStorage.removeItem("selectedTemplate")
    }
    setShowThemeInput(false)
    handleGenerate()
  }

  const handleGenerate = async () => {
    if (!apiKey) {
      setErrorMessage("Please provide a valid OpenAI API key first.")
      return
    }

    setIsGenerating(true)
    setErrorMessage(null)

    try {
      const plan = stagePlans[currentStage] || ""
      const feedback = feedbacks[currentStage] || ""
      const newStage = await generateGameStage(
        currentStage,
        gameTheme || themeInput,
        stages,
        apiKey,
        model,
        plan,
        feedback,
        selectedTemplate,
        totalStages,
      )

      // Check if the stage has an error title
      if (newStage.title.includes("Error") || newStage.title.includes("API Key Missing")) {
        setErrorMessage(newStage.description)
      } else {
        // Ensure the stage has an ID
        if (!newStage.id) {
          newStage.id = `game-${currentStage + 1}-${Date.now()}`
        }

        setStages([...stages, newStage])
        setCurrentStage(currentStage + 1)

        if (currentStage + 1 === totalStages) {
          setIsComplete(true)
        }

        // Reset iframe state for new content
        setIframeLoaded(false)
        setIframeError(null)
        setLogs([])
        setRefreshKey((prev) => prev + 1)
      }
    } catch (error: any) {
      console.error("Error generating game stage:", error)
      setErrorMessage(error.message || "Failed to generate game stage. Please check your API key and try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFixGame = async () => {
    if (!apiKey || stages.length === 0) {
      return
    }

    setIsFixing(true)
    setErrorMessage(null)

    try {
      const latestStage = stages[stages.length - 1]
      const fixedGame = await fixGameCode(latestStage, errorDetails, apiKey, model)

      // Update the latest stage with the fixed code
      const updatedStages = [...stages]
      updatedStages[updatedStages.length - 1] = fixedGame
      setStages(updatedStages)

      // Reset iframe state for new content
      setIframeLoaded(false)
      setIframeError(null)
      setLogs([])
      setRefreshKey((prev) => prev + 1)
      setShowFixDialog(false)
      setErrorDetails("")
    } catch (error: any) {
      console.error("Error fixing game code:", error)
      setErrorMessage(error.message || "Failed to fix game code. Please try again.")
    } finally {
      setIsFixing(false)
    }
  }

  const handleRevert = (index: number) => {
    const newStages = stages.slice(0, index + 1)
    setStages(newStages)
    setCurrentStage(index + 1)
    setIsComplete(false)
    saveGames(newStages)
  }

  const handleExport = () => {
    const data = compressStages(stages)
    navigator.clipboard.writeText(data).then(() => {
      alert("Game data copied to clipboard")
    })
  }

  const handleImport = async () => {
    const data = prompt("Paste exported game data")
    if (data) {
      try {
        const imported = decompressStages(data)
        setStages(imported)
        setCurrentStage(imported.length)
        setIsComplete(imported.length === totalStages)
        saveGames(imported)
      } catch (e) {
        alert("Invalid data")
      }
    }
  }

  const refreshFinalGamePreview = () => {
    setIframeLoaded(false)
    setIframeError(null)
    setLogs([])
    setRefreshKey((prev) => prev + 1)
  }

  // Function to open game in a new window with direct game data
  const openFullscreenPreview = () => {
    if (stages.length === 0) return

    setIsOpeningNewTab(true)

    try {
      const latestStage = stages[stages.length - 1]

      // Ensure the game has an ID
      if (!latestStage.id) {
        latestStage.id = `game-${stages.length}-${Date.now()}`

        // Update the stages array with the new ID
        const updatedStages = [...stages]
        updatedStages[updatedStages.length - 1] = latestStage
        setStages(updatedStages)
      }

      // Save to localStorage first (as a backup)
      try {
        localStorage.setItem("generatedGames", JSON.stringify(stages))
        console.log("Game data saved to localStorage")
      } catch (err) {
        console.warn("Failed to save to localStorage, continuing with URL method:", err)
      }

      // Create a compressed version of the game data to pass in the URL
      const gameData = {
        id: latestStage.id,
        title: latestStage.title,
        description: latestStage.description,
        html: latestStage.html,
        css: latestStage.css,
        js: latestStage.js,
        md: latestStage.md,
      }

      // Convert game data to base64 to make it URL-safe
      const gameDataStr = JSON.stringify(gameData)
      const gameDataB64 = btoa(encodeURIComponent(gameDataStr))

      // Open the game in a new tab with the game data in the URL
      window.open(`/game/${latestStage.id}?data=${gameDataB64}`, "_blank")

      console.log("Game opened in new tab with direct data")
    } catch (error) {
      console.error("Error opening game in new tab:", error)
      setErrorMessage("Failed to open game in new tab: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsOpeningNewTab(false)
    }
  }

  // Generate iframe content with proper error handling
  const generateFinalGameIframeContent = () => {
    if (stages.length === 0) return ""

    const latestStage = stages[stages.length - 1]

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Add THREE.js library -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-family: 'Arial', sans-serif;
            background-color: white;
          }
          #game-container {
            width: 100%;
            height: 100%;
            overflow: auto;
            position: relative;
          }
          #error-display {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(255,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            z-index: 9999;
            max-width: 80%;
            word-break: break-word;
          }
          #debug-panel {
            position: fixed;
            top: 0;
            right: 0;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px;
            font-family: monospace;
            font-size: 10px;
            z-index: 9999;
            max-width: 300px;
            max-height: 200px;
            overflow: auto;
            display: none;
          }
          * {
            box-sizing: border-box;
          }
          ${latestStage.css}
        </style>
      </head>
      <body>
        <div id="game-container">
          ${latestStage.html}
        </div>
        <div id="debug-panel"></div>
        <script>
          // Check if THREE is available, if not, provide a mock object
          if (typeof THREE === 'undefined') {
            console.log('THREE.js not found, creating mock object');
            window.THREE = {
              Scene: function() { return { add: function() {} } },
              PerspectiveCamera: function() { return {} },
              WebGLRenderer: function() { return { 
                setSize: function() {}, 
                render: function() {},
                domElement: document.createElement('div')
              } },
              BoxGeometry: function() { return {} },
              MeshBasicMaterial: function() { return {} },
              Mesh: function() { return {} },
              Vector3: function() { return {} },
              Clock: function() { return { getElapsedTime: function() { return 0; } } }
            };
          }
          
          // Debug panel
          const debugPanel = document.getElementById('debug-panel');
          const originalConsoleLog = console.log;
          console.log = function() {
            originalConsoleLog.apply(console, arguments);
            if (debugPanel) {
              const args = Array.from(arguments);
              const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : arg
              ).join(' ');
              debugPanel.innerHTML += message + '<br>';
              debugPanel.style.display = 'block';
            }
            
            // Send log to parent window
            try {
              window.parent.postMessage({
                type: 'gameLog',
                message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
              }, '*');
            } catch (e) {
              // Ignore messaging errors
            }
          };
          
          // Console error handler
          window.onerror = function(message, source, lineno, colno, error) {
            console.log('Game error:', message, 'at', source, lineno, colno);
            
            // Display error in the iframe
            var errorDisplay = document.createElement('div');
            errorDisplay.id = 'error-display';
            errorDisplay.textContent = 'Error: ' + message;
            document.body.appendChild(errorDisplay);
            
            // Send error to parent window
            window.parent.postMessage({
              type: 'finalGameError',
              error: message,
              source: source,
              line: lineno
            }, '*');
            
            return false;
          };
          
          // Log initialization
          console.log('Final game iframe loaded, initializing...');
          
          // Run the game code
          try {
            // Wrap in DOMContentLoaded if not already present in the code
            if (!${latestStage.js.includes("DOMContentLoaded")}) {
              document.addEventListener('DOMContentLoaded', function() {
                try {
                  console.log('DOMContentLoaded fired, running game code...');
                  ${latestStage.js}
                  console.log('Game initialization complete');
                  
                  // Send success message to parent
                  window.parent.postMessage({
                    type: 'finalGameLoaded',
                    success: true
                  }, '*');
                } catch (e) {
                  console.log('Error during game initialization:', e.message);
                  var errorDisplay = document.createElement('div');
                  errorDisplay.id = 'error-display';
                  errorDisplay.textContent = 'Error: ' + e.message;
                  document.body.appendChild(errorDisplay);
                  
                  // Send error to parent window
                  window.parent.postMessage({
                    type: 'finalGameError',
                    error: e.message
                  }, '*');
                }
              });
            } else {
              // Code already has DOMContentLoaded handler
              console.log('Game code contains DOMContentLoaded handler');
              ${latestStage.js}
              
              // Send success message to parent
              setTimeout(function() {
                window.parent.postMessage({
                  type: 'finalGameLoaded',
                  success: true
                }, '*');
              }, 100);
            }
            
            // Dispatch DOMContentLoaded manually if it might have already fired
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              console.log('Document already loaded, dispatching DOMContentLoaded manually');
              setTimeout(() => {
                const event = new Event('DOMContentLoaded');
                document.dispatchEvent(event);
              }, 100);
            }
          } catch (e) {
            console.log('Error executing game code:', e.message);
            var errorDisplay = document.createElement('div');
            errorDisplay.id = 'error-display';
            errorDisplay.textContent = 'Error: ' + e.message;
            document.body.appendChild(errorDisplay);
            
            // Send error to parent window
            window.parent.postMessage({
              type: 'finalGameError',
              error: e.message
            }, '*');
          }
        </script>
      </body>
      </html>
    `
  }

  // Set up message listener for iframe communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "finalGameError") {
        console.error("Final game error received from iframe:", event.data.error)
        setIframeError(event.data.error)
      } else if (event.data.type === "finalGameLoaded") {
        console.log("Final game loaded successfully in iframe")
        setIframeLoaded(true)
      } else if (event.data.type === "gameLog") {
        console.log("Game log:", event.data.message)
        setLogs((prev) => [...prev, event.data.message])
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  // Update final game iframe when stages change
  useEffect(() => {
    if (finalGameIframeRef.current && stages.length > 0) {
      setIframeLoaded(false)
      setIframeError(null)
      setLogs([])
      finalGameIframeRef.current.srcdoc = generateFinalGameIframeContent()
    }
  }, [stages, refreshKey])

  // Function to reset the game generator
  const handleReset = () => {
    if (confirm("Are you sure you want to reset the game generator? This will delete all your progress.")) {
      setStages([])
      setCurrentStage(0)
      setIsComplete(false)
      setGameTheme("")
      setShowThemeInput(true)
      localStorage.removeItem("generatedGames")
      localStorage.removeItem("gameTheme")
    }
  }

  return (
    <div className="space-y-8">
      {/* Documentation Section */}
      <PipelineDocumentation />

      {/* API Key Form */}
      {!apiKey && <ApiKeyForm onApiKeyValidated={handleApiKeyValidated} />}

      {/* Theme Input */}
      {apiKey && showThemeInput && (
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">What kind of game would you like to create?</h2>
          <div className="space-y-4">
            <p className="text-purple-200">
              Enter a theme or concept for your game. Be as specific or creative as you'd like!
            </p>
            <Input
              placeholder="e.g., space adventure, medieval fantasy, puzzle game..."
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-purple-200">Stages:</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={totalStages}
                onChange={(e) => setTotalStages(parseInt(e.target.value))}
                className="w-20 bg-white/5 border-white/10 text-white"
              />
              <label className="text-sm text-purple-200">Model:</label>
              <select
                className="bg-white/5 border-white/10 text-white p-2 rounded"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <TemplateSelector onSelect={setSelectedTemplate} />
            <div className="space-y-2">
              {Array.from({ length: totalStages }).map((_, i) => (
                <Textarea
                  key={i}
                  placeholder={`Stage ${i + 1} focus (optional)`}
                  value={stagePlans[i] || ""}
                  onChange={(e) => {
                    const plans = [...stagePlans]
                    plans[i] = e.target.value
                    setStagePlans(plans)
                  }}
                  className="min-h-[60px]"
                />
              ))}
            </div>
            <Button
              onClick={handleStartGeneration}
              disabled={!themeInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
            >
              Start Creating
            </Button>
            <p className="text-xs text-purple-300/70">
              Your settings and progress will be saved in your browser so you can return later.
            </p>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-md text-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Error</h3>
              <p>{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Stages */}
      {apiKey && !showThemeInput && (
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-purple-500/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Game Evolution Pipeline</h2>
              <p className="text-purple-200 text-sm mt-1">Theme: {gameTheme}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="text-purple-200 text-sm whitespace-nowrap">
                Stage {currentStage}/5 {isComplete ? "(Complete)" : ""}
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isComplete}
                className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : currentStage === 0 ? (
                  "Generate First Stage"
                ) : currentStage === totalStages ? (
                  "Generation Complete!"
                ) : (
                  "Generate Next Stage"
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-red-500/50 hover:bg-red-700/30 text-red-300 hover:text-red-100"
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {stages.map((stage, index) => (
              <GameStage
                key={index}
                stageNumber={index + 1}
                stageData={stage}
                isLatest={index === stages.length - 1}
                onRevert={index < stages.length - 1 ? () => handleRevert(index) : undefined}
              />
            ))}

            {stages.length > 0 && !isComplete && (
              <div className="space-y-2">
                <p className="text-purple-200">Feedback or requests for the next stage:</p>
                <Textarea
                  value={feedbacks[currentStage] || ""}
                  onChange={(e) => {
                    const fbs = [...feedbacks]
                    fbs[currentStage] = e.target.value
                    setFeedbacks(fbs)
                    localStorage.setItem("stageFeedbacks", JSON.stringify(fbs))
                  }}
                  className="min-h-[80px]"
                />
              </div>
            )}

            {stages.length === 0 && (
              <div className="text-center py-12 text-purple-200">
                <p className="text-xl mb-4">Ready to build your "{gameTheme}" game!</p>
                <p>Click the "Generate First Stage" button above to start creating your game.</p>
                <p className="mt-4 text-sm opacity-70">
                  Each stage will build upon the previous one, creating a more complex and engaging game.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Final Game Preview */}
      {stages.length > 0 && (
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-purple-500/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Final Game</h2>
            <div className="flex gap-2">
              <Button
                onClick={refreshFinalGamePreview}
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-700/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setShowFixDialog(true)}
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-700/30"
                disabled={isFixing}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Fix Game
              </Button>
              <Button
                onClick={openFullscreenPreview}
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-700/30"
                disabled={isOpeningNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button onClick={handleExport} variant="outline" className="border-purple-500/50 hover:bg-purple-700/30">
                Export
              </Button>
              <Button onClick={handleImport} variant="outline" className="border-purple-500/50 hover:bg-purple-700/30">
                Import
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="mb-4">
              <TabsList className="bg-purple-950/50 w-full justify-start">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="md">Documentation</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="m-0">
              <div className="bg-white rounded-lg overflow-hidden relative" style={{ height: "600px" }}>
                {!iframeLoaded && !iframeError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">Loading game preview...</p>
                  </div>
                )}

                {iframeError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 z-10 p-4">
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 max-w-md">
                      <h3 className="font-bold">Error Loading Game</h3>
                      <p className="text-sm">{iframeError}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={refreshFinalGamePreview} className="bg-purple-600 hover:bg-purple-700">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                      <Button
                        onClick={() => setShowFixDialog(true)}
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={isFixing}
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Fix Game
                      </Button>
                      <Button
                        onClick={openFullscreenPreview}
                        variant="outline"
                        className="border-purple-500/50 hover:bg-purple-700/30"
                        disabled={isOpeningNewTab}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Try in New Tab
                      </Button>
                    </div>
                  </div>
                )}

                <iframe
                  key={refreshKey}
                  ref={finalGameIframeRef}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Final Game Preview"
                  sandbox="allow-scripts allow-popups"
                />
              </div>
            </TabsContent>

            <TabsContent value="logs" className="m-0">
              <div className="bg-gray-900 p-4 overflow-auto h-[400px] rounded-lg">
                <div className="font-mono text-sm text-gray-300">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="py-1 border-b border-gray-800">
                        {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No logs available. Run the game to see console output here.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="md" className="m-0">
              <div className="bg-gray-900 p-4 overflow-auto h-[400px] rounded-lg">
                <div className="prose prose-invert max-w-none">
                  {stages.length > 0 && stages[stages.length - 1].md ? (
                    <ReactMarkdown>{stages[stages.length - 1].md}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-400">No documentation available for this stage.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-3 bg-yellow-500/10 rounded border border-yellow-500/20 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-300">
              <p className="font-medium">Game not displaying correctly?</p>
              <p className="mt-1">
                Try the "Refresh" button to reload the game, or use the "Fix Game" button to have AI fix rendering
                issues. For the best experience, click "Open in New Tab" to play the game in a dedicated browser window.
              </p>
            </div>
          </div>

          {/* Download Game Button */}
          {stages.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={openFullscreenPreview}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isOpeningNewTab}
              >
                {isOpeningNewTab ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Play Full Game
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Fix Game Dialog */}
      <Dialog open={showFixDialog} onOpenChange={setShowFixDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Fix Game Rendering Issues</DialogTitle>
            <DialogDescription>
              Describe the issues you're experiencing with the game rendering. The AI will attempt to fix the code.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="e.g., The game shows a white screen, elements are not visible, controls don't work..."
              value={errorDetails}
              onChange={(e) => setErrorDetails(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFixDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFixGame} disabled={isFixing} className="bg-purple-600 hover:bg-purple-700">
              {isFixing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <Wrench className="mr-2 h-4 w-4" />
                  Fix Game
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
