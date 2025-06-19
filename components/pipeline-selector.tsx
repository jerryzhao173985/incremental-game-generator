"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Zap, 
  Layers, 
  Plus, 
  Trash2, 
  Clock, 
  BarChart3,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { 
  PipelineConfig, 
  StageTemplate, 
  AVAILABLE_PIPELINES,
  DEFAULT_5_STAGE_PIPELINE,
  EXTENDED_10_STAGE_PIPELINE,
  PipelineManager
} from "@/lib/pipeline-config"

interface PipelineSelectorProps {
  onPipelineSelect: (config: PipelineConfig) => void
  currentConfig?: PipelineConfig
}

export default function PipelineSelector({ onPipelineSelect, currentConfig }: PipelineSelectorProps) {
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineConfig>(
    currentConfig || DEFAULT_5_STAGE_PIPELINE
  )
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [customStages, setCustomStages] = useState<StageTemplate[]>([])
  const [newStageName, setNewStageName] = useState("")
  const [newStageDescription, setNewStageDescription] = useState("")
  const [newStageComplexity, setNewStageComplexity] = useState<'low' | 'medium' | 'high'>('medium')
  const [showDetails, setShowDetails] = useState(false)

  const handlePipelineChange = (pipelineId: string) => {
    const pipeline = AVAILABLE_PIPELINES.find(p => p.id === pipelineId)
    if (pipeline) {
      setSelectedPipeline(pipeline)
      if (pipeline.id !== 'custom-flexible') {
        onPipelineSelect(pipeline)
      }
    }
  }

  const addCustomStage = () => {
    if (!newStageName.trim()) return

    const newStage: StageTemplate = {
      id: `custom-${Date.now()}`,
      name: newStageName,
      description: newStageDescription || `Custom stage: ${newStageName}`,
      objectives: [`Complete ${newStageName.toLowerCase()} implementation`],
      focus: [`${newStageName} development`],
      requirements: ['Custom implementation'],
      estimatedComplexity: newStageComplexity
    }

    setCustomStages([...customStages, newStage])
    setNewStageName("")
    setNewStageDescription("")
    setNewStageComplexity('medium')
  }

  const removeCustomStage = (stageId: string) => {
    setCustomStages(customStages.filter(s => s.id !== stageId))
  }

  const createCustomPipeline = () => {
    if (customStages.length < 3) {
      alert("Custom pipeline must have at least 3 stages")
      return
    }

    const customConfig: PipelineConfig = {
      id: `custom-${Date.now()}`,
      name: "Custom Pipeline",
      description: `Custom ${customStages.length}-stage pipeline`,
      totalStages: customStages.length,
      minStages: customStages.length,
      maxStages: customStages.length,
      allowCustomStages: true,
      stages: customStages
    }

    onPipelineSelect(customConfig)
    setShowCustomDialog(false)
  }

  const getPipelineIcon = (pipelineId: string) => {
    switch (pipelineId) {
      case 'classic-5-stage':
        return <Zap className="h-5 w-5" />
      case 'extended-10-stage':
        return <Layers className="h-5 w-5" />
      case 'custom-flexible':
        return <Settings className="h-5 w-5" />
      default:
        return <BarChart3 className="h-5 w-5" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'high':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const manager = new PipelineManager(selectedPipeline)
  const isValid = manager.validatePipeline()

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pipeline Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AVAILABLE_PIPELINES.map((pipeline) => (
              <Card 
                key={pipeline.id}
                className={`cursor-pointer transition-all ${
                  selectedPipeline.id === pipeline.id 
                    ? 'border-purple-400 bg-purple-500/20' 
                    : 'border-purple-500/30 bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => handlePipelineChange(pipeline.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getPipelineIcon(pipeline.id)}
                    <h3 className="font-semibold text-white">{pipeline.name}</h3>
                  </div>
                  <p className="text-purple-200 text-sm mb-3">{pipeline.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="border-purple-400 text-purple-200">
                      {pipeline.totalStages} stages
                    </Badge>
                    {pipeline.allowCustomStages && (
                      <Badge variant="outline" className="border-blue-400 text-blue-200">
                        Customizable
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPipeline.id === 'custom-flexible' && (
            <div className="mt-4">
              <Button 
                onClick={() => setShowCustomDialog(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Pipeline
              </Button>
            </div>
          )}

          {selectedPipeline.id !== 'custom-flexible' && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">Pipeline Overview</h4>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="border-purple-500/50 text-purple-200"
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-300">{selectedPipeline.totalStages}</div>
                  <div className="text-xs text-purple-200">Total Stages</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-300">
                    {manager.getEstimatedTimeRemaining([])}
                  </div>
                  <div className="text-xs text-blue-200">Est. Time</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-300">
                    {selectedPipeline.stages.filter(s => s.estimatedComplexity === 'low').length}
                  </div>
                  <div className="text-xs text-green-200">Simple</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-300">
                    {selectedPipeline.stages.filter(s => s.estimatedComplexity === 'high').length}
                  </div>
                  <div className="text-xs text-red-200">Complex</div>
                </div>
              </div>

              {showDetails && (
                <div className="space-y-3">
                  <h5 className="text-white font-medium">Stage Breakdown</h5>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedPipeline.stages.map((stage, index) => (
                      <div key={stage.id} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-purple-400 text-purple-200">
                              Stage {index + 1}
                            </Badge>
                            <span className="text-white font-medium">{stage.name}</span>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getComplexityColor(stage.estimatedComplexity)}`}></div>
                        </div>
                        <p className="text-purple-200 text-sm mb-2">{stage.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {stage.focus.slice(0, 2).map((focus, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-purple-700/30">
                              {focus}
                            </Badge>
                          ))}
                          {stage.focus.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-purple-700/30">
                              +{stage.focus.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-200 text-sm">
                  Pipeline validated successfully - Ready to use
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Pipeline Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create Custom Pipeline</DialogTitle>
            <DialogDescription>
              Design your own pipeline by adding custom stages. Each stage will build upon the previous ones.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="stages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stages">Stages ({customStages.length})</TabsTrigger>
              <TabsTrigger value="add">Add Stage</TabsTrigger>
            </TabsList>

            <TabsContent value="stages" className="space-y-4">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {customStages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No stages added yet. Use the "Add Stage" tab to create your pipeline.</p>
                  </div>
                ) : (
                  customStages.map((stage, index) => (
                    <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Stage {index + 1}</Badge>
                          <span className="font-medium">{stage.name}</span>
                          <div className={`w-2 h-2 rounded-full ${getComplexityColor(stage.estimatedComplexity)}`}></div>
                        </div>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomStage(stage.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="stage-name">Stage Name</Label>
                  <Input
                    id="stage-name"
                    placeholder="e.g., Advanced AI Systems"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="stage-description">Description</Label>
                  <Textarea
                    id="stage-description"
                    placeholder="Describe what this stage will accomplish..."
                    value={newStageDescription}
                    onChange={(e) => setNewStageDescription(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="stage-complexity">Complexity</Label>
                  <Select value={newStageComplexity} onValueChange={(value: 'low' | 'medium' | 'high') => setNewStageComplexity(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Simple implementation</SelectItem>
                      <SelectItem value="medium">Medium - Moderate complexity</SelectItem>
                      <SelectItem value="high">High - Complex features</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={addCustomStage} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stage
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createCustomPipeline}
              disabled={customStages.length < 3}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create Pipeline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}