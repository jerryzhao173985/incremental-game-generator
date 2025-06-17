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
            Multi-Staged Game Generation Pipeline Documentation
          </div>
          <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-purple-700">
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="prose prose-invert max-w-none">
          <div className="text-purple-100 text-sm space-y-4">
            <h3 className="text-xl font-semibold text-purple-200">Multi-Staged Game Development Process</h3>

            <p>
              This application builds games through a flexible, configurable pipeline with 3-10 progressive stages. 
              Each stage builds upon the previous one, with customizable focus areas and intelligent progression management.
              The process uses a two-step approach for each stage:
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

            <h4 className="text-lg font-semibold text-purple-200">Pipeline Configuration:</h4>

            <div className="bg-blue-500/10 p-4 rounded-md border border-blue-500/30 my-4">
              <h4 className="text-lg font-semibold text-blue-300 mt-0">Flexible Stage Management</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>3-Stage Quick Mode:</strong> Rapid prototyping (Core → Enhanced → Complete)</li>
                <li><strong>5-Stage Standard Mode:</strong> Balanced development (Classic workflow)</li>
                <li><strong>7-Stage Extended Mode:</strong> Detailed progression with refinement phases</li>
                <li><strong>10-Stage Advanced Mode:</strong> Maximum granularity for complex games</li>
                <li><strong>Custom Mode:</strong> User-defined stage count and focus areas</li>
              </ul>
            </div>

            <h4 className="text-lg font-semibold text-purple-200">Standard Pipeline Templates:</h4>

            <div className="space-y-3">
              <div className="bg-purple-800/30 p-3 rounded-md border border-purple-500/30">
                <h5 className="font-semibold text-purple-200">3-Stage Quick Mode</h5>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li><strong>Core Foundation:</strong> Basic mechanics, UI, and playability</li>
                  <li><strong>Enhanced Features:</strong> Progression systems and improved interactions</li>
                  <li><strong>Complete Game:</strong> Polish, effects, and final features</li>
                </ol>
              </div>

              <div className="bg-purple-800/30 p-3 rounded-md border border-purple-500/30">
                <h5 className="font-semibold text-purple-200">5-Stage Standard Mode (Classic)</h5>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li><strong>Core Concept:</strong> Foundation with basic structure and mechanics</li>
                  <li><strong>Enhanced Mechanics:</strong> Expanded gameplay and interactions</li>
                  <li><strong>Complete Game:</strong> Full game loop with polished UI</li>
                  <li><strong>Advanced Features:</strong> Sophisticated algorithms and systems</li>
                  <li><strong>Final Polish:</strong> Optimizations and special effects</li>
                </ol>
              </div>

              <div className="bg-purple-800/30 p-3 rounded-md border border-purple-500/30">
                <h5 className="font-semibold text-purple-200">7-Stage Extended Mode</h5>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li><strong>Initial Concept:</strong> Basic structure and core mechanics</li>
                  <li><strong>Core Gameplay:</strong> Primary interactions and game loop</li>
                  <li><strong>Enhanced Systems:</strong> Progression and feedback systems</li>
                  <li><strong>Visual Polish:</strong> Improved graphics and animations</li>
                  <li><strong>Advanced Features:</strong> Complex algorithms and systems</li>
                  <li><strong>Optimization Pass:</strong> Performance and usability improvements</li>
                  <li><strong>Final Polish:</strong> Special effects and finishing touches</li>
                </ol>
              </div>

              <div className="bg-purple-800/30 p-3 rounded-md border border-purple-500/30">
                <h5 className="font-semibold text-purple-200">10-Stage Advanced Mode</h5>
                <ol className="list-decimal pl-5 space-y-1 text-sm">
                  <li><strong>Foundation:</strong> Basic structure and HTML layout</li>
                  <li><strong>Core Mechanics:</strong> Essential gameplay systems</li>
                  <li><strong>Interactivity:</strong> User input and basic responses</li>
                  <li><strong>Visual Design:</strong> Styling and basic animations</li>
                  <li><strong>Game Logic:</strong> Rules, scoring, and state management</li>
                  <li><strong>Enhanced UX:</strong> Feedback systems and polish</li>
                  <li><strong>Advanced Features:</strong> Complex algorithms and mechanics</li>
                  <li><strong>Performance:</strong> Optimization and smooth gameplay</li>
                  <li><strong>Special Effects:</strong> Advanced animations and polish</li>
                  <li><strong>Final Release:</strong> Bug fixes and final touches</li>
                </ol>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-purple-200">Advanced Features:</h4>

            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dynamic Stage Templates:</strong> AI adapts stage focus based on game complexity</li>
              <li><strong>Parallel Development:</strong> Work on multiple aspects simultaneously</li>
              <li><strong>Stage Branching:</strong> Create alternative implementations or features</li>
              <li><strong>Rollback System:</strong> Revert to previous stages if needed</li>
              <li><strong>Custom Stage Insertion:</strong> Add specialized stages mid-development</li>
              <li><strong>Progress Visualization:</strong> Enhanced progress tracking and dependency mapping</li>
            </ul>

            <h4 className="text-lg font-semibold text-purple-200">How It Works:</h4>

            <ol className="list-decimal pl-5 space-y-2">
              <li>Enter your OpenAI API key to authenticate with the API.</li>
              <li>Choose your pipeline configuration (Quick, Standard, Extended, Advanced, or Custom).</li>
              <li>Provide a theme for your game (e.g., space adventure, medieval fantasy).</li>
              <li>Configure stage-specific focus areas if using Custom mode.</li>
              <li>
                The application generates detailed specifications for each stage based on your theme and configuration.
              </li>
              <li>
                Each stage builds upon previous stages with intelligent context awareness.
              </li>
              <li>Review generated code, documentation, and preview the game at each stage.</li>
              <li>Use advanced controls to modify, branch, or extend the pipeline as needed.</li>
              <li>
                Open the final game in a new tab for the best playing experience.
              </li>
            </ol>

            <div className="bg-green-500/10 p-4 rounded-md border border-green-500/30 my-4">
              <h4 className="text-lg font-semibold text-green-300 mt-0">New Pipeline Controls</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Stage Manager:</strong> Visual pipeline overview with stage dependencies</li>
                <li><strong>Parallel Processing:</strong> Generate multiple stages simultaneously</li>
                <li><strong>Custom Templates:</strong> Create and save your own stage progression templates</li>
                <li><strong>Stage Editor:</strong> Modify individual stages before or after generation</li>
                <li><strong>Branch Management:</strong> Create alternative versions and compare results</li>
                <li><strong>Auto-Save System:</strong> Persistent pipeline state with recovery options</li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 p-4 rounded-md border border-yellow-500/30 my-4">
              <h4 className="text-lg font-semibold text-yellow-300 mt-0">Playing Your Game</h4>
              <p className="mb-2">For the best gaming experience:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Click the "Open in New Tab" button to play the game in a dedicated browser window</li>
                <li>Use the Stage Comparison tool to see how your game evolved</li>
                <li>Test different pipeline configurations to find your ideal development flow</li>
                <li>Export pipeline configurations for reuse in future projects</li>
                <li>Your game progress and pipeline state are saved automatically</li>
              </ul>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-md border border-blue-500/30 my-4">
              <h4 className="text-lg font-semibold text-blue-300 mt-0">Advanced Troubleshooting</h4>
              <p className="mb-2">Multi-staged pipeline troubleshooting:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Pipeline Debugger to identify stage generation issues</li>
                <li>Stage Rollback feature allows reverting problematic generations</li>
                <li>Parallel generation helps identify optimal stage sequences</li>
                <li>Custom stage insertion for fixing specific issues</li>
                <li>Enhanced error reporting with stage-specific context</li>
                <li>Pipeline health checks before starting generation</li>
              </ul>
            </div>

            <p>
              The multi-staged approach provides unprecedented flexibility in game development, allowing you to tailor 
              the development process to your specific needs while maintaining the incremental evolution that makes 
              the process engaging and educational.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}