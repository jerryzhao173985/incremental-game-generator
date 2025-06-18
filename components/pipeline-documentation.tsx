"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, FileText, Play, Cog, Rocket, Star, Zap } from "lucide-react"
import { Button } from "./ui/button"

// Move steps array outside component to avoid repeated allocations
const HOW_IT_WORKS_STEPS = [
  "Enter your OpenAI API key to authenticate with the service",
  "Provide a theme for your game (e.g., space adventure, medieval fantasy)",
  "AI generates detailed specifications for the current stage based on your theme",
  "Specifications are implemented into working game code (HTML, CSS, JavaScript)",
  "Review the generated code, documentation, and preview your game",
  "Generate the next stage, which builds upon the previous stage",
  "Continue through all five stages to complete your game journey",
  "Open the game in a new tab for the best playing experience"
]

export default function PipelineDocumentation() {
  const [isExpanded, setIsExpanded] = useState(true) // Default to expanded

  const handleToggle = () => {
    setIsExpanded(prev => !prev)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border-purple-400/40 mb-8 shadow-xl">
      <CardHeader
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={handleKeyDown}
        className="pb-4 cursor-pointer transition-colors hover:bg-white/5 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50" 
        onClick={handleToggle}
      >
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-purple-500/20 p-2 rounded-lg mr-3">
              <FileText className="h-6 w-6 text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Game Generation Pipeline Documentation</h2>
              <p className="text-sm text-purple-200 font-normal mt-1">Learn how AI builds your game step by step</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-purple-200 hover:text-white hover:bg-purple-600/30 transition-all duration-200"
            tabIndex={-1}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="prose prose-invert max-w-none px-6 pb-6">
          <div className="text-purple-100 space-y-6">
            
            {/* Main Introduction */}
            <div className="bg-gradient-to-r from-purple-800/30 to-indigo-800/30 p-6 rounded-xl border border-purple-500/30">
              <h3 className="text-2xl font-bold text-purple-100 mb-3 flex items-center">
                <Rocket className="h-6 w-6 mr-3 text-purple-300" />
                Incremental Game Development Process
              </h3>
              <p className="text-lg leading-relaxed text-purple-200">
                This application builds a game through five progressive stages, with each stage building upon the previous
                one. The process uses a sophisticated two-step approach for each stage to ensure quality and coherence.
              </p>
            </div>

            {/* Process Steps */}
            <div className="grid md:grid-cols-2 gap-4 my-6">
              <div className="bg-blue-500/10 p-5 rounded-xl border border-blue-400/30">
                <h4 className="text-lg font-semibold text-blue-300 mb-3 flex items-center">
                  <Cog className="h-5 w-5 mr-2" />
                  Step 1: Specification Generation
                </h4>
                <p className="text-blue-200 leading-relaxed">
                  AI creates detailed specifications for the current stage using GPT-4o, ensuring each addition is purposeful and well-planned.
                </p>
              </div>
              <div className="bg-green-500/10 p-5 rounded-xl border border-green-400/30">
                <h4 className="text-lg font-semibold text-green-300 mb-3 flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Step 2: Code Implementation
                </h4>
                <p className="text-green-200 leading-relaxed">
                  AI implements the specifications into working game code using GPT-4o, bringing your vision to life with clean, functional code.
                </p>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-purple-200 mb-4 flex items-center">
                <Zap className="h-6 w-6 mr-3 text-yellow-400" />
                Five-Stage Development Pipeline
              </h4>

              <div className="space-y-4">
                {/* Stage 1 */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 rounded-xl border-l-4 border-emerald-400">
                  <div className="flex items-start">
                    <div className="bg-emerald-500/20 text-emerald-300 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                      1
                    </div>
                    <div>
                      <h5 className="text-xl font-semibold text-emerald-300 mb-2">Core Concept</h5>
                      <p className="text-emerald-200 leading-relaxed">
                        Creates the foundation with basic structure, core mechanics, and initial interactivity. 
                        This establishes the groundwork for your entire game experience.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-5 rounded-xl border-l-4 border-blue-400">
                  <div className="flex items-start">
                    <div className="bg-blue-500/20 text-blue-300 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                      2
                    </div>
                    <div>
                      <h5 className="text-xl font-semibold text-blue-300 mb-2">Enhanced Mechanics</h5>
                      <p className="text-blue-200 leading-relaxed">
                        Expands gameplay with improved interactions, progression systems, and additional visual elements 
                        that make the game more engaging and dynamic.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-5 rounded-xl border-l-4 border-purple-400">
                  <div className="flex items-start">
                    <div className="bg-purple-500/20 text-purple-300 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                      3
                    </div>
                    <div>
                      <h5 className="text-xl font-semibold text-purple-300 mb-2">Complete Game</h5>
                      <p className="text-purple-200 leading-relaxed">
                        Delivers a fully functional game with polished UI, complete game loop, refined visuals, 
                        and comprehensive state management. Your game feels complete at this stage.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-5 rounded-xl border-l-4 border-orange-400">
                  <div className="flex items-start">
                    <div className="bg-orange-500/20 text-orange-300 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                      4
                    </div>
                    <div>
                      <h5 className="text-xl font-semibold text-orange-300 mb-2">Advanced Features</h5>
                      <p className="text-orange-200 leading-relaxed">
                        Adds sophisticated features like complex algorithms, advanced scoring systems, 
                        special effects, and additional game modes for enhanced gameplay depth.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stage 5 */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 p-5 rounded-xl border-l-4 border-yellow-400">
                  <div className="flex items-start">
                    <div className="bg-yellow-500/20 text-yellow-300 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1 relative">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xl font-semibold text-yellow-300 mb-2">Final Polish</h5>
                      <p className="text-yellow-200 leading-relaxed">
                        Perfects the game with final visual polish, performance optimizations, 
                        and special touches that elevate the experience to professional quality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Development Focus Callout */}
            <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 p-6 rounded-xl border border-purple-400/40 my-6">
              <h4 className="text-xl font-bold text-purple-200 mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-400" />
                Development Philosophy
              </h4>
              <div className="space-y-3 text-purple-200 leading-relaxed">
                <p>
                  <strong className="text-purple-100">Stages 1-3:</strong> Focus on building a complete, playable game with all core features. 
                  By Stage 3, you'll have a fully functional game that feels finished and polished.
                </p>
                <p>
                  <strong className="text-purple-100">Stages 4-5:</strong> Advanced enhancements and professional polish, 
                  adding sophisticated features and refinements that elevate your game beyond the basics.
                </p>
              </div>
            </div>

            {/* How It Works Section */}
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-purple-200 flex items-center">
                <Cog className="h-6 w-6 mr-3 text-purple-400" />
                How It Works
              </h4>

              <div className="grid gap-3">
                {HOW_IT_WORKS_STEPS.map((step, index) => (
                  <div key={index} className="flex items-start p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="bg-purple-500/30 text-purple-200 rounded-full w-7 h-7 flex items-center justify-center font-semibold mr-4 mt-0.5 text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-purple-200 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaming Experience Callout */}
            <div className="bg-gradient-to-r from-yellow-500/15 to-orange-500/15 p-6 rounded-xl border border-yellow-400/40">
              <h4 className="text-xl font-bold text-yellow-300 mb-3 flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Optimal Gaming Experience
              </h4>
              <p className="text-yellow-200 mb-4 text-lg">For the best gaming experience and performance:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-yellow-200">
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">▶</span>
                    Click "Open in New Tab" for dedicated gaming window
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">▶</span>
                    Ensures optimal performance and functionality
                  </li>
                </ul>
                <ul className="space-y-2 text-yellow-200">
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">▶</span>
                    Progress saves automatically in your browser
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">▶</span>
                    Return to generator anytime to continue development
                  </li>
                </ul>
              </div>
            </div>

            {/* Troubleshooting Section */}
            <div className="bg-gradient-to-r from-blue-500/15 to-cyan-500/15 p-6 rounded-xl border border-blue-400/40">
              <h4 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
                <Cog className="h-5 w-5 mr-2" />
                Troubleshooting Guide
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-blue-200 mb-3 font-medium">If your game doesn't render correctly:</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <ul className="space-y-2 text-blue-200">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">🔄</span>
                        Try the "Refresh" button to reload the game
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">🔧</span>
                        Use "Fix Game" button for AI-powered issue resolution
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">📊</span>
                        Check the "Logs" tab for error messages
                      </li>
                    </ul>
                    <ul className="space-y-2 text-blue-200">
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">🚀</span>
                        Always try "Open in New Tab" for best results
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">🔒</span>
                        Ensure browser allows localStorage (not incognito)
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-400 mr-2">🏠</span>
                        Return to main page if you get "No games found"
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Viewing Features */}
            <div className="bg-gradient-to-r from-green-500/15 to-emerald-500/15 p-6 rounded-xl border border-green-400/40">
              <h4 className="text-xl font-bold text-green-300 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Game Viewing Features
              </h4>
              <p className="text-green-200 mb-4">When viewing your game in a new tab, you have access to:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-green-200">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">🎮</span>
                    <strong>"Game" tab:</strong> Play in full screen mode
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">💻</span>
                    <strong>"Code" tab:</strong> View and copy HTML, CSS, JavaScript
                  </li>
                </ul>
                <ul className="space-y-2 text-green-200">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">📝</span>
                    <strong>"Logs" tab:</strong> Console output and debug information
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">📚</span>
                    <strong>"Documentation" tab:</strong> Understand how your game works
                  </li>
                </ul>
              </div>
              <div className="mt-4 p-3 bg-green-600/20 rounded-lg">
                <p className="text-green-200 text-sm">
                  <strong>Pro Tip:</strong> Use the "Show Debug Panel" button to see real-time console logs while playing!
                </p>
              </div>
            </div>

            {/* Final Note */}
            <div className="text-center pt-4">
              <p className="text-lg text-purple-200 leading-relaxed">
                Each stage preserves the core elements from previous stages while adding new features and improvements.
                This incremental approach allows you to watch your game evolve from a simple concept to a fully
                functional, polished interactive experience.
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}