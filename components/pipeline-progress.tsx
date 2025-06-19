"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Zap, 
  BarChart3, 
  PlayCircle,
  PauseCircle,
  RotateCcw,
  FastForward,
  Settings,
  TrendingUp
} from "lucide-react"
import { PipelineConfig, StageTemplate, PipelineManager } from "@/lib/pipeline-config"
import { GameStageData } from "./game-generator"

interface PipelineProgressProps {
  config: PipelineConfig
  completedStages: GameStageData[]
  currentStage: number
  isGenerating: boolean
  onStageSelect?: (stageIndex: number) => void
  onRegenerateStage?: (stageIndex: number) => void
  showTimeEstimates?: boolean
}

export default function PipelineProgress({ 
  config, 
  completedStages, 
  currentStage, 
  isGenerating,
  onStageSelect,
  onRegenerateStage,
  showTimeEstimates = true
}: PipelineProgressProps) {
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)

  const manager = new PipelineManager(config)
  const progressPercentage = manager.calculateProgress(completedStages.map(s => s.id || ''))
  const completedStageIds = new Set(completedStages.map(s => s.id).filter(Boolean))

  // Update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const getStageStatus = (stageIndex: number, stage: StageTemplate) => {
    if (stageIndex < currentStage) {
      return 'completed'
    } else if (stageIndex === currentStage && isGenerating) {
      return 'generating'
    } else if (stageIndex === currentStage) {
      return 'current'
    } else {
      return 'pending'
    }
  }

  const getStatusIcon = (status: string, complexity: string) => {
    const iconClass = `h-5 w-5 ${
      status === 'completed' ? 'text-green-400' :
      status === 'generating' ? 'text-blue-400 animate-spin' :
      status === 'current' ? 'text-purple-400' :
      'text-gray-400'
    }`

    switch (status) {
      case 'completed':
        return <CheckCircle2 className={iconClass} />
      case 'generating':
        return <Zap className={iconClass} />
      case 'current':
        return <PlayCircle className={iconClass} />
      default:
        return <Circle className={iconClass} />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'border-l-green-400 bg-green-50/10'
      case 'medium':
        return 'border-l-yellow-400 bg-yellow-50/10'
      case 'high':
        return 'border-l-red-400 bg-red-50/10'
      default:
        return 'border-l-gray-400 bg-gray-50/10'
    }
  }

  const handleStageClick = (stageIndex: number) => {
    setSelectedStage(selectedStage === stageIndex ? null : stageIndex)
    onStageSelect?.(stageIndex)
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pipeline Progress
          </div>
          <div className="flex items-center gap-4 text-sm">
            {showTimeEstimates && (
              <div className="flex items-center gap-2 text-purple-200">
                <Clock className="h-4 w-4" />
                {formatTime(elapsedTime)}
              </div>
            )}
            <Badge variant="outline" className="border-purple-400 text-purple-200">
              {currentStage}/{config.totalStages}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-200">Overall Progress</span>
            <span className="text-white font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span>{completedStages.length} completed</span>
            <span>{config.totalStages - completedStages.length} remaining</span>
          </div>
        </div>

        <Separator className="bg-purple-500/30" />

        {/* Stage Timeline */}
        <div className="space-y-1">
          <h4 className="text-white font-medium mb-3">Stage Timeline</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {config.stages.map((stage, index) => {
              const status = getStageStatus(index, stage)
              const isSelected = selectedStage === index
              const canRegenerate = status === 'completed' && onRegenerateStage

              return (
                <div key={stage.id} className="space-y-2">
                  <div
                    className={`
                      p-3 rounded-lg border-l-4 cursor-pointer transition-all
                      ${getComplexityColor(stage.estimatedComplexity)}
                      ${isSelected ? 'ring-2 ring-purple-400' : ''}
                      ${status === 'generating' ? 'animate-pulse' : ''}
                      hover:bg-white/5
                    `}
                    onClick={() => handleStageClick(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status, stage.estimatedComplexity)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{stage.name}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                stage.estimatedComplexity === 'low' ? 'border-green-400 text-green-200' :
                                stage.estimatedComplexity === 'medium' ? 'border-yellow-400 text-yellow-200' :
                                'border-red-400 text-red-200'
                              }`}
                            >
                              {stage.estimatedComplexity}
                            </Badge>
                          </div>
                          <p className="text-purple-200 text-sm">{stage.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {status === 'generating' && (
                          <Badge className="bg-blue-500/20 text-blue-200 border-blue-400">
                            Generating...
                          </Badge>
                        )}
                        {status === 'completed' && (
                          <Badge className="bg-green-500/20 text-green-200 border-green-400">
                            Completed
                          </Badge>
                        )}
                        {status === 'current' && !isGenerating && (
                          <Badge className="bg-purple-500/20 text-purple-200 border-purple-400">
                            Ready
                          </Badge>
                        )}
                        {canRegenerate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onRegenerateStage(index)
                            }}
                            className="h-8 w-8 p-0 text-purple-300 hover:text-white"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Stage Details */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-purple-500/30 space-y-3">
                        <div>
                          <h5 className="text-white font-medium mb-2">Objectives</h5>
                          <ul className="list-disc list-inside space-y-1 text-purple-200 text-sm">
                            {stage.objectives.map((objective, idx) => (
                              <li key={idx}>{objective}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="text-white font-medium mb-2">Key Focus Areas</h5>
                          <div className="flex flex-wrap gap-1">
                            {stage.focus.map((focus, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-purple-700/30">
                                {focus}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {stage.dependencies && stage.dependencies.length > 0 && (
                          <div>
                            <h5 className="text-white font-medium mb-2">Dependencies</h5>
                            <div className="flex flex-wrap gap-1">
                              {stage.dependencies.map((depId, idx) => {
                                const depStage = config.stages.find(s => s.id === depId)
                                return depStage ? (
                                  <Badge key={idx} variant="outline" className="text-xs border-blue-400 text-blue-200">
                                    {depStage.name}
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          </div>
                        )}

                        {completedStages[index] && (
                          <div>
                            <h5 className="text-white font-medium mb-2">Implementation</h5>
                            <div className="text-purple-200 text-sm">
                              <p><strong>Title:</strong> {completedStages[index].title}</p>
                              <p><strong>Description:</strong> {completedStages[index].description}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Connection Line */}
                  {index < config.stages.length - 1 && (
                    <div className="flex justify-center">
                      <div className={`w-0.5 h-4 ${
                        index < currentStage ? 'bg-green-400' : 'bg-gray-600'
                      }`}></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Statistics */}
        {showTimeEstimates && completedStages.length > 0 && (
          <>
            <Separator className="bg-purple-500/30" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-300">{completedStages.length}</div>
                <div className="text-xs text-green-200">Completed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-300">{config.totalStages - completedStages.length}</div>
                <div className="text-xs text-purple-200">Remaining</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-300">{formatTime(elapsedTime)}</div>
                <div className="text-xs text-blue-200">Elapsed</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-yellow-300">
                  {manager.getEstimatedTimeRemaining(completedStages.map(s => s.id || ''))}
                </div>
                <div className="text-xs text-yellow-200">Est. Remaining</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}