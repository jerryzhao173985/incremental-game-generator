"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { 
  Settings, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  Zap,
  GitBranch,
  ArrowRight,
  ArrowDown,
  Eye,
  Edit,
  Copy,
  Save
} from 'lucide-react'

import { PipelineManager } from '@/lib/pipeline-utils'
import { 
  PipelineConfiguration, 
  PipelineTemplate, 
  PipelineStage, 
  PipelineProgress,
  PIPELINE_TEMPLATES 
} from '@/lib/pipeline-types'

interface PipelineConfiguratorProps {
  onConfigurationSelect: (config: PipelineConfiguration) => void
  onStartExecution: (configId: string) => void
  currentConfig?: PipelineConfiguration
}

export default function PipelineConfigurator({ 
  onConfigurationSelect, 
  onStartExecution,
  currentConfig 
}: PipelineConfiguratorProps) {
  const [pipelineManager] = useState(() => PipelineManager.getInstance())
  const [configurations, setConfigurations] = useState<PipelineConfiguration[]>([])
  const [selectedConfig, setSelectedConfig] = useState<PipelineConfiguration | null>(currentConfig || null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Creation form state
  const [newConfigName, setNewConfigName] = useState('')
  const [newConfigDescription, setNewConfigDescription] = useState('')
  const [newConfigTheme, setNewConfigTheme] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic-five-stage')

  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = () => {
    const configs = pipelineManager.getAllConfigurations()
    setConfigurations(configs)
    
    if (currentConfig) {
      setSelectedConfig(currentConfig)
    } else if (configs.length > 0 && !selectedConfig) {
      setSelectedConfig(configs[0])
    }
  }

  const handleCreateConfiguration = () => {
    if (!newConfigName.trim() || !newConfigTheme.trim()) return

    const config = pipelineManager.createConfiguration(
      newConfigName.trim(),
      newConfigDescription.trim(),
      newConfigTheme.trim(),
      selectedTemplate
    )

    setConfigurations([...configurations, config])
    setSelectedConfig(config)
    onConfigurationSelect(config)
    
    // Reset form
    setNewConfigName('')
    setNewConfigDescription('')
    setNewConfigTheme('')
    setShowCreateDialog(false)
  }

  const handleDeleteConfiguration = (configId: string) => {
    if (confirm('Are you sure you want to delete this configuration?')) {
      pipelineManager.deleteConfiguration(configId)
      loadConfigurations()
      
      if (selectedConfig?.id === configId) {
        setSelectedConfig(null)
      }
    }
  }

  const handleSelectConfiguration = (config: PipelineConfiguration) => {
    setSelectedConfig(config)
    onConfigurationSelect(config)
  }

  const handleStartExecution = () => {
    if (!selectedConfig) return
    
    // Initialize progress if not exists
    let progress = pipelineManager.getProgress(selectedConfig.id)
    if (!progress) {
      progress = pipelineManager.initializeProgress(selectedConfig.id)
    }
    
    onStartExecution(selectedConfig.id)
  }

  const handleExportConfiguration = () => {
    if (!selectedConfig) return
    
    const exportData = pipelineManager.exportConfiguration(selectedConfig.id)
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `pipeline-${selectedConfig.name.replace(/[^a-z0-9]/gi, '-')}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const handleImportConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        const config = pipelineManager.importConfiguration(data)
        loadConfigurations()
        setSelectedConfig(config)
        onConfigurationSelect(config)
      } catch (error) {
        alert('Failed to import configuration: ' + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      core: 'bg-blue-500',
      visual: 'bg-green-500',
      audio: 'bg-purple-500',
      optimization: 'bg-orange-500',
      testing: 'bg-red-500',
      polish: 'bg-pink-500'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-500'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-600',
      high: 'bg-orange-600',
      medium: 'bg-yellow-600',
      low: 'bg-green-600'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-600'
  }

  const renderStageCard = (stage: PipelineStage, progress?: PipelineProgress) => {
    const isCompleted = progress?.completedStages.includes(stage.id) || false
    const isCurrent = progress?.currentStage === stage.id
    const canExecute = selectedConfig ? pipelineManager.canExecuteStage(stage.id, selectedConfig.id) : false

    return (
      <Card key={stage.id} className={`p-4 ${isCurrent ? 'ring-2 ring-purple-500' : ''} ${isCompleted ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{stage.name}</h4>
              {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
              {isCurrent && <Zap className="h-4 w-4 text-yellow-500" />}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stage.description}</p>
            
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="outline" className={`${getCategoryColor(stage.category)} text-white text-xs`}>
                {stage.category}
              </Badge>
              <Badge variant="outline" className={`${getPriorityColor(stage.priority)} text-white text-xs`}>
                {stage.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {stage.estimatedDuration}m
              </Badge>
            </div>
          </div>
        </div>
        
        {stage.dependencies.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            <span className="font-medium">Dependencies: </span>
            {stage.dependencies.join(', ')}
          </div>
        )}

        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Objectives:</span>
            <ul className="text-xs text-gray-600 dark:text-gray-400 ml-3">
              {stage.objectives.slice(0, 2).map((obj, i) => (
                <li key={i} className="list-disc">{obj}</li>
              ))}
              {stage.objectives.length > 2 && (
                <li className="list-disc text-gray-500">+{stage.objectives.length - 2} more...</li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    )
  }

  const renderProgressOverview = () => {
    if (!selectedConfig) return null

    const progress = pipelineManager.getProgress(selectedConfig.id)
    const stages = pipelineManager.getStagesForConfiguration(selectedConfig.id)
    const completionPercentage = pipelineManager.getCompletionPercentage(selectedConfig.id)
    const totalDuration = pipelineManager.calculateTotalDuration(selectedConfig.id)

    return (
      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Progress Overview</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Completed Stages:</span>
                <div className="font-medium">{progress?.completedStages.length || 0} / {stages.length}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Est. Total Time:</span>
                <div className="font-medium">{totalDuration} minutes</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Current Stage:</span>
                <div className="font-medium">{progress?.currentStage || 'Not started'}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Time Remaining:</span>
                <div className="font-medium">{progress?.estimatedTimeRemaining || totalDuration} min</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white/10 backdrop-blur-sm border-purple-500/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Pipeline Configurator</h2>
            <p className="text-purple-200 text-sm">Create and manage custom game development pipelines</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Pipeline
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Pipeline</DialogTitle>
                  <DialogDescription>
                    Create a custom game development pipeline based on a template
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Pipeline Name</label>
                    <Input 
                      placeholder="My Game Pipeline"
                      value={newConfigName}
                      onChange={(e) => setNewConfigName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      placeholder="Describe your pipeline..."
                      value={newConfigDescription}
                      onChange={(e) => setNewConfigDescription(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Game Theme</label>
                    <Input 
                      placeholder="e.g., space adventure, puzzle game..."
                      value={newConfigTheme}
                      onChange={(e) => setNewConfigTheme(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Template</label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIPELINE_TEMPLATES.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateConfiguration}
                      disabled={!newConfigName.trim() || !newConfigTheme.trim()}
                    >
                      Create Pipeline
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportConfiguration}
                disabled={!selectedConfig}
                className="border-purple-500/50 hover:bg-purple-700/30"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  className="border-purple-500/50 hover:bg-purple-700/30"
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4" />
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportConfiguration}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Configuration List */}
      {configurations.length > 0 && (
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">Your Pipelines</h3>
          <div className="grid gap-3">
            {configurations.map(config => (
              <div 
                key={config.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedConfig?.id === config.id 
                    ? 'border-purple-500 bg-purple-600/20' 
                    : 'border-gray-600 hover:border-purple-400 bg-white/5'
                }`}
                onClick={() => handleSelectConfiguration(config)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{config.name}</h4>
                    <p className="text-sm text-purple-200 mt-1">{config.description}</p>
                    <p className="text-xs text-purple-300 mt-1">Theme: {config.theme}</p>
                    
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {config.selectedStages.length} stages
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {pipelineManager.calculateTotalDuration(config.id)}m total
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartExecution()
                      }}
                      disabled={selectedConfig?.id !== config.id}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteConfiguration(config.id)
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-600/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pipeline Details */}
      {selectedConfig && (
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-purple-500/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">{selectedConfig.name}</h3>
            <Button 
              onClick={handleStartExecution}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Execution
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-purple-950/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stages">Stages</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              {renderProgressOverview()}
            </TabsContent>

            <TabsContent value="stages" className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-white">Pipeline Stages</h4>
                  <Badge variant="outline" className="text-purple-200">
                    {selectedConfig.selectedStages.length} stages
                  </Badge>
                </div>
                
                <div className="grid gap-4">
                  {pipelineManager.getStagesForConfiguration(selectedConfig.id).map(stage => 
                    renderStageCard(stage, pipelineManager.getProgress(selectedConfig.id))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              <div className="space-y-4">
                <h4 className="font-medium text-white">Pipeline Settings</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="parallel"
                      checked={selectedConfig.settings.allowParallelExecution}
                      onCheckedChange={(checked) => {
                        const updated = { ...selectedConfig }
                        updated.settings.allowParallelExecution = checked as boolean
                        pipelineManager.updateConfiguration(updated)
                        setSelectedConfig(updated)
                      }}
                    />
                    <label htmlFor="parallel" className="text-sm text-white">
                      Allow parallel stage execution
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="autosave"
                      checked={selectedConfig.settings.autoSave}
                      onCheckedChange={(checked) => {
                        const updated = { ...selectedConfig }
                        updated.settings.autoSave = checked as boolean
                        pipelineManager.updateConfiguration(updated)
                        setSelectedConfig(updated)
                      }}
                    />
                    <label htmlFor="autosave" className="text-sm text-white">
                      Auto-save progress
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="branching"
                      checked={selectedConfig.settings.enableBranching}
                      onCheckedChange={(checked) => {
                        const updated = { ...selectedConfig }
                        updated.settings.enableBranching = checked as boolean
                        pipelineManager.updateConfiguration(updated)
                        setSelectedConfig(updated)
                      }}
                    />
                    <label htmlFor="branching" className="text-sm text-white">
                      Enable pipeline branching
                    </label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      {configurations.length === 0 && (
        <Card className="p-8 bg-white/10 backdrop-blur-sm border-purple-500/30 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">No Pipelines Yet</h3>
          <p className="text-purple-200 mb-4">Create your first custom game development pipeline to get started.</p>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Pipeline
          </Button>
        </Card>
      )}
    </div>
  )
}