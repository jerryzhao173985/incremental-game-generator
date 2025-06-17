"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Download, ExternalLink, Loader2, RefreshCw, Wrench, Settings, Zap } from "lucide-react"
import ReactMarkdown from "react-markdown"

import { generateEnhancedGameStage, generateGameStageWithPipeline } from "@/app/actions/generate-game-enhanced"
import { fixGameCode } from "@/app/actions/generate-game"
import GameStage from "./game-stage"
import ApiKeyForm from "./api-key-form"
import PipelineSelector from "./pipeline-selector"
import PipelineProgress from "./pipeline-progress"
import { saveGames } from "@/lib/game-utils"

import { 
  PipelineConfig, 
  DEFAULT_5_STAGE_PIPELINE, 
  PipelineManager
} from "@/lib/pipeline-config"

export type GameStageData = {
  title: string
  description: string
  html: string
  css: string
  js: string
  md?: string
  id?: string
}

interface GenerationOptions {
  useParallelGeneration?: boolean
  enableAutoOptimization?: boolean
  validateStages?: boolean
}

export default function EnhancedGameGenerator() {
  const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>(DEFAULT_5_STAGE_PIPELINE)
  const [stages, setStages] = useState<GameStageData[]>([])
  const [currentStage, setCurrentStage] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [gameTheme, setGameTheme] = useState("")
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [themeInput, setThemeInput] = useState("")
  const [showThemeInput, setShowThemeInput] = useState(false)
  const [showPipelineSelector, setShowPipelineSelector] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showFixDialog, setShowFixDialog] = useState(false)
  const [errorDetails, setErrorDetails] = useState("")
  const [activeTab, setActiveTab] = useState("preview")
  const [logs, setLogs] = useState<string[]>([])
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    useParallelGeneration: false,
    enableAutoOptimization: true,
    validateStages: true
  })
  const finalGameIframeRef = useRef<HTMLIFrameElement>(null)
  const [isOpeningNewTab, setIsOpeningNewTab] = useState(false)
  const [pipelineManager] = useState(() => new PipelineManager(pipelineConfig))

  // Load saved data
  useEffect(() => {
    try {
      const storedApiKey = localStorage.getItem("openai_api_key")
      if (storedApiKey) {
        setApiKey(storedApiKey)
      }

      const storedGames = localStorage.getItem("generatedGames")
      const storedPipeline = localStorage.getItem("pipelineConfig")
      
      if (storedPipeline) {
        const parsedPipeline = JSON.parse(storedPipeline)
        setPipelineConfig(parsedPipeline)
        pipelineManager.config = parsedPipeline
      }

      if (storedGames) {
        const games = JSON.parse(storedGames)
        if (Array.isArray(games) && games.length > 0) {
          if (stages.length === 0) {
            setStages(games)
            setCurrentStage(games.length)
            setGameTheme(localStorage.getItem("gameTheme") || "")
            setShowThemeInput(false)
            if (games.length === pipelineConfig.totalStages) {
              setIsComplete(true)
            }
          }
        } else if (storedApiKey) {
          setShowThemeInput(true)
        }
      } else if (storedApiKey) {
        setShowThemeInput(true)
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
    }
  }, [])

  // Save data whenever it changes
  useEffect(() => {
    if (stages.length > 0) {
      try {
        const saved = saveGames(stages)
        if (saved) {
          localStorage.setItem("gameTheme", gameTheme)
          localStorage.setItem("pipelineConfig", JSON.stringify(pipelineConfig))
        }
      } catch (error) {
        console.error("Error saving data:", error)
      }
    }
  }, [stages, gameTheme, pipelineConfig])

  const handleApiKeyValidated = (key: string) => {
    setApiKey(key)
    setShowThemeInput(true)
  }

  const handlePipelineSelect = (config: PipelineConfig) => {
    setPipelineConfig(config)
    pipelineManager.config = config
    setShowPipelineSelector(false)
    
    // Reset if switching pipelines
    if (stages.length > 0 && stages.length !== config.totalStages) {
      if (confirm("Switching pipelines will reset your current progress. Continue?")) {
        handleReset()
      }
    }
  }

  const handleStartGeneration = () => {
    if (!themeInput.trim()) {
      alert("Please enter a theme for your game")
      return
    }

    setGameTheme(themeInput)
    setShowThemeInput(false)
    handleGenerate()
  }

  const handleGenerate = async () => {
    if (!apiKey) {
      setErrorMessage("Please provide a valid OpenAI API key first.")
      return
    }

    if (currentStage >= pipelineConfig.totalStages) {
      setErrorMessage("All stages have been completed!")
      return
    }

    setIsGenerating(true)
    setErrorMessage(null)

    try {
      console.log(`Generating stage ${currentStage + 1} using pipeline: ${pipelineConfig.name}`)
      
      const newStage = await generateGameStageWithPipeline(
        currentStage,
        gameTheme || themeInput,
        stages,
        apiKey,
        pipelineConfig
      )

      if (newStage.title.includes("Error") || newStage.title.includes("API Key Missing")) {
        setErrorMessage(newStage.description)
      } else {
        if (!newStage.id) {
          newStage.id = `stage-${currentStage + 1}-${Date.now()}`
        }

        setStages([...stages, newStage])
        setCurrentStage(currentStage + 1)

        if (currentStage + 1 === pipelineConfig.totalStages) {
          setIsComplete(true)
        }

        // Reset iframe state
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

  const handleRegenerateStage = async (stageIndex: number) => {
    if (!apiKey || stageIndex >= stages.length) {
      return
    }

    setIsGenerating(true)
    setErrorMessage(null)

    try {
      const previousStages = stages.slice(0, stageIndex)
      const regeneratedStage = await generateGameStageWithPipeline(
        stageIndex,
        gameTheme,
        previousStages,
        apiKey,
        pipelineConfig
      )

      if (!regeneratedStage.id) {
        regeneratedStage.id = `stage-${stageIndex + 1}-${Date.now()}`
      }

      const updatedStages = [...stages]
      updatedStages[stageIndex] = regeneratedStage
      
      // Remove stages after the regenerated one
      setStages(updatedStages.slice(0, stageIndex + 1))
      setCurrentStage(stageIndex + 1)
      setIsComplete(false)

      setRefreshKey((prev) => prev + 1)
    } catch (error: any) {
      console.error("Error regenerating stage:", error)
      setErrorMessage(error.message || "Failed to regenerate stage.")
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
      const fixedGame = await fixGameCode(latestStage, errorDetails, apiKey)

      const updatedStages = [...stages]
      updatedStages[updatedStages.length - 1] = fixedGame
      setStages(updatedStages)

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

  const refreshFinalGamePreview = () => {
    setIframeLoaded(false)
    setIframeError(null)
    setLogs([])
    setRefreshKey((prev) => prev + 1)
  }

  const openFullscreenPreview = () => {
    if (stages.length === 0) return

    setIsOpeningNewTab(true)

    try {
      const latestStage = stages[stages.length - 1]

      if (!latestStage.id) {
        latestStage.id = `game-${stages.length}-${Date.now()}`
        const updatedStages = [...stages]
        updatedStages[updatedStages.length - 1] = latestStage
        setStages(updatedStages)
      }

      try {
        localStorage.setItem("generatedGames", JSON.stringify(stages))
        console.log("Game data saved to localStorage")
      } catch (err) {
        console.warn("Failed to save to localStorage, continuing with URL method:", err)
      }

      const gameData = {
        id: latestStage.id,
        title: latestStage.title,
        description: latestStage.description,
        html: latestStage.html,
        css: latestStage.css,
        js: latestStage.js,
        md: latestStage.md,
      }

      const gameDataStr = JSON.stringify(gameData)
      const gameDataB64 = btoa(encodeURIComponent(gameDataStr))

      window.open(`/game/${latestStage.id}?data=${gameDataB64}`, "_blank")
      console.log("Game opened in new tab")
    } catch (error) {
      console.error("Error opening game in new tab:", error)
      setErrorMessage("Failed to open game in new tab: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setIsOpeningNewTab(false)
    }
  }

  const generateFinalGameIframeContent = () => {
    if (stages.length === 0) return ""

    const latestStage = stages[stages.length - 1]

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          ${latestStage.css}
        </style>
      </head>
      <body>
        <div id="game-container">
          ${latestStage.html}
        </div>
        <script>
          ${latestStage.js}
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
    return () => window.removeEventListener("message", handleMessage)
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

  const handleReset = () => {
    if (confirm("Are you sure you want to reset? This will delete all progress.")) {
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
      {/* API Key Form */}
      {!apiKey && <ApiKeyForm onApiKeyValidated={handleApiKeyValidated} />}

      {/* Pipeline Configuration */}
      {apiKey && !showThemeInput && stages.length === 0 && (
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Choose Your Pipeline</h2>
            <Button
              onClick={() => setShowPipelineSelector(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure Pipeline
            </Button>
          </div>
          <div className="text-purple-200">
            <p>Current Pipeline: <strong>{pipelineConfig.name}</strong></p>
            <p>{pipelineConfig.description}</p>
            <p>Stages: {pipelineConfig.totalStages}</p>
          </div>
        </Card>
      )}

      {/* Theme Input */}
      {apiKey && showThemeInput && (
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">What kind of game would you like to create?</h2>
          <div className="space-y-4">
            <p className="text-purple-200">
              Enter a theme or concept for your {pipelineConfig.totalStages}-stage game development pipeline.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="e.g., space adventure, medieval fantasy, puzzle game..."
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                className="flex-grow bg-white/5 border-white/10 text-white"
              />
              <Button
                onClick={handleStartGeneration}
                disabled={!themeInput.trim()}
                className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Pipeline
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-purple-300/70">
                Using {pipelineConfig.name} ({pipelineConfig.totalStages} stages)
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPipelineSelector(true)}
                className="border-purple-500/50 text-purple-200"
              >
                Change Pipeline
              </Button>
            </div>
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

      {/* Pipeline Progress */}
      {apiKey && !showThemeInput && stages.length > 0 && (
        <PipelineProgress
          config={pipelineConfig}
          completedStages={stages}
          currentStage={currentStage}
          isGenerating={isGenerating}
          onRegenerateStage={handleRegenerateStage}
          showTimeEstimates={true}
        />
      )}

      {/* Game Generation Controls */}
      {apiKey && !showThemeInput && (
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-purple-500/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">Enhanced Game Generation</h2>
              <p className="text-purple-200 text-sm mt-1">
                Theme: {gameTheme} | Pipeline: {pipelineConfig.name}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
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
                ) : currentStage === pipelineConfig.totalStages ? (
                  "Pipeline Complete!"
                ) : (
                  `Generate Stage ${currentStage + 1}`
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
              />
            ))}

            {stages.length === 0 && (
              <div className="text-center py-12 text-purple-200">
                <p className="text-xl mb-4">Ready to build your "{gameTheme}" game!</p>
                <p>Click "Generate First Stage" to start the {pipelineConfig.name}.</p>
                <p className="mt-4 text-sm opacity-70">
                  Each stage will build upon the previous one through {pipelineConfig.totalStages} carefully designed steps.
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
            <h2 className="text-2xl font-bold text-white">Final Game Preview</h2>
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
                    <p className="text-gray-600">Loading enhanced game preview...</p>
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
                    </div>
                  </div>
                )}

                <iframe
                  key={refreshKey}
                  ref={finalGameIframeRef}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Enhanced Game Preview"
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

      {/* Pipeline Selector Dialog */}
      <Dialog open={showPipelineSelector} onOpenChange={setShowPipelineSelector}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Pipeline Configuration</DialogTitle>
            <DialogDescription>
              Choose how you want to structure your game development process.
            </DialogDescription>
          </DialogHeader>
          <PipelineSelector
            onPipelineSelect={handlePipelineSelect}
            currentConfig={pipelineConfig}
          />
        </DialogContent>
      </Dialog>

      {/* Fix Game Dialog */}
      <Dialog open={showFixDialog} onOpenChange={setShowFixDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Fix Game Issues</DialogTitle>
            <DialogDescription>
              Describe any issues you're experiencing with the game.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <textarea
              placeholder="e.g., Game shows white screen, controls don't work, elements not visible..."
              value={errorDetails}
              onChange={(e) => setErrorDetails(e.target.value)}
              className="min-h-[100px] p-3 border rounded-md"
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