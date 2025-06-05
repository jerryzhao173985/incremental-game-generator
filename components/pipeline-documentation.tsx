"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"
import { Button } from "./ui/button"

export default function PipelineDocumentation() {
  const [isExpanded, setIsExpanded] = useState(true) // Default to expanded

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30 mb-8">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Game Generation Pipeline Documentation
          </div>
          <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-purple-700">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="prose prose-invert max-w-none">
          <div className="text-purple-100 text-sm space-y-4">
            <h3 className="text-xl font-semibold text-purple-200">Incremental Game Development Process</h3>

            <p>
              This application builds a game through multiple progressive stages, with each stage building upon the previous
              one. The process uses a two-step approach for each stage:
            </p>

            <ol className="list-decimal pl-5 space-y-1">
              <li>
                <strong>Specification Generation</strong> - AI creates detailed specifications for the current stage
                using GPT-4o
              </li>
              <li>
                <strong>Code Implementation</strong> - AI implements the specifications into working game code using
                GPT-4o
              </li>
            </ol>

            <h4 className="text-lg font-semibold text-purple-200">Pipeline Stages:</h4>

            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Stage 1: Core Concept</strong> - Creates the foundation of the game with basic structure, core
                mechanics, and initial interactivity. This establishes the groundwork for the game.
              </li>
              <li>
                <strong>Stage 2: Enhanced Mechanics</strong> - Expands the core gameplay with improved interactions,
                game progression systems, and additional visual elements.
              </li>
              <li>
                <strong>Stage 3: Complete Game</strong> - Delivers a fully functional game with polished UI, complete
                game loop, refined visuals, and comprehensive game state management. The game should feel complete at
                this stage.
              </li>
              <li>
                <strong>Stage 4: Advanced Features</strong> - Adds sophisticated features like complex algorithms,
                advanced scoring systems, special effects, and additional game modes.
              </li>
              <li>
                <strong>Stage 5: Final Polish</strong> - Perfects the game with final visual polish, performance
                optimizations, and special touches that elevate the experience.
              </li>
            </ol>

            <div className="bg-purple-800/30 p-4 rounded-md border border-purple-500/30 my-4">
              <h4 className="text-lg font-semibold text-purple-200 mt-0">Development Focus</h4>
              <p className="mb-2">
                The first three stages focus on building a complete, playable game with all core features. By Stage 3,
                you should have a fully functional game that feels finished.
              </p>
              <p>
                Stages 4 and 5 are for advanced enhancements and polish, adding sophisticated features and refinements
                that elevate the game beyond the basics.
              </p>
            </div>

            <h4 className="text-lg font-semibold text-purple-200">How It Works:</h4>

            <ol className="list-decimal pl-5 space-y-2">
              <li>Enter your OpenAI API key to authenticate with the API.</li>
              <li>Provide a theme for your game (e.g., space adventure, medieval fantasy).</li>
              <li>
                The application first generates detailed specifications for the current stage based on your theme and
                previous stages.
              </li>
              <li>
                These specifications are then used to generate the actual game code (HTML, CSS, JavaScript) and
                documentation.
              </li>
              <li>Review the generated code, documentation, and preview the game.</li>
              <li>Generate the next stage, which builds upon the previous stage.</li>
              <li>Continue through all stages to complete your game.</li>
              <li>
                Open the game in a new tab for the best playing experience, or use the "Fix Game" button if you
                encounter rendering issues.
              </li>
            </ol>

            <div className="bg-yellow-500/10 p-4 rounded-md border border-yellow-500/30 my-4">
              <h4 className="text-lg font-semibold text-yellow-300 mt-0">Playing Your Game</h4>
              <p className="mb-2">For the best gaming experience:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Click the "Open in New Tab" button to play the game in a dedicated browser window</li>
                <li>This provides the best performance and ensures all game elements work correctly</li>
                <li>Your game progress is saved automatically in your browser</li>
                <li>You can return to the generator at any time to continue developing your game</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-md border border-blue-500/30 my-4">
              <h4 className="text-lg font-semibold text-blue-300 mt-0">Troubleshooting</h4>
              <p className="mb-2">If your game doesn't render correctly:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Try the "Refresh" button to reload the game</li>
                <li>Use the "Fix Game" button to have AI fix rendering issues</li>
                <li>Check the "Logs" tab to see any console output or errors</li>
                <li>Always try "Open in New Tab" for the most reliable game experience</li>
                <li>If you see a white screen, check the console logs for error messages</li>
                <li>
                  If you get "No games found" error, try going back to the main page and clicking "Open in New Tab"
                  again
                </li>
                <li>Make sure your browser allows localStorage (not in incognito/private mode)</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-md border border-blue-500/30 my-4">
              <h4 className="text-lg font-semibold text-blue-300 mt-0">Game Viewing Features</h4>
              <p className="mb-2">When viewing your game in a new tab:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the "Game" tab to play your game in full screen</li>
                <li>Switch to the "Code" tab to view and copy the HTML, CSS, and JavaScript</li>
                <li>Check the "Logs" tab to see console output and debug information</li>
                <li>Read the "Documentation" tab to understand how your game works</li>
                <li>Use the "Show Debug Panel" button to see real-time console logs while playing</li>
              </ul>
            </div>

            <p>
              Each stage preserves the core elements from previous stages while adding new features and improvements.
              This incremental approach allows you to see how the game evolves from a simple concept to a fully
              functional interactive experience.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
