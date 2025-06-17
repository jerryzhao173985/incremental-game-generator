// Pipeline Management Utilities

import { 
  PipelineStage, 
  PipelineTemplate, 
  PipelineConfiguration, 
  PipelineProgress,
  GameStageResult,
  PIPELINE_TEMPLATES,
  DEFAULT_PIPELINE_SETTINGS
} from './pipeline-types'

export class PipelineManager {
  private static instance: PipelineManager
  private configurations: Map<string, PipelineConfiguration> = new Map()
  private progress: Map<string, PipelineProgress> = new Map()

  private constructor() {
    this.loadFromLocalStorage()
  }

  public static getInstance(): PipelineManager {
    if (!PipelineManager.instance) {
      PipelineManager.instance = new PipelineManager()
    }
    return PipelineManager.instance
  }

  // Configuration Management
  public createConfiguration(
    name: string,
    description: string,
    theme: string,
    templateId?: string
  ): PipelineConfiguration {
    const id = `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const template = templateId ? this.getTemplate(templateId) : PIPELINE_TEMPLATES[0]
    
    const config: PipelineConfiguration = {
      id,
      name,
      description,
      theme,
      selectedStages: template.stages.map(s => s.id),
      customStages: [],
      settings: { ...DEFAULT_PIPELINE_SETTINGS },
      created: new Date(),
      modified: new Date()
    }

    this.configurations.set(id, config)
    this.saveToLocalStorage()
    return config
  }

  public getConfiguration(id: string): PipelineConfiguration | undefined {
    return this.configurations.get(id)
  }

  public updateConfiguration(config: PipelineConfiguration): void {
    config.modified = new Date()
    this.configurations.set(config.id, config)
    this.saveToLocalStorage()
  }

  public deleteConfiguration(id: string): boolean {
    const deleted = this.configurations.delete(id)
    this.progress.delete(id)
    this.saveToLocalStorage()
    return deleted
  }

  public getAllConfigurations(): PipelineConfiguration[] {
    return Array.from(this.configurations.values())
  }

  // Template Management
  public getTemplate(id: string): PipelineTemplate | undefined {
    return PIPELINE_TEMPLATES.find(t => t.id === id)
  }

  public getAllTemplates(): PipelineTemplate[] {
    return PIPELINE_TEMPLATES
  }

  // Stage Management
  public getStagesForConfiguration(configId: string): PipelineStage[] {
    const config = this.getConfiguration(configId)
    if (!config) return []

    const template = this.getTemplate('classic-five-stage') // Default fallback
    if (!template) return []

    const allStages = [...template.stages, ...config.customStages]
    return config.selectedStages.map(stageId => 
      allStages.find(s => s.id === stageId)
    ).filter(Boolean) as PipelineStage[]
  }

  public addCustomStage(configId: string, stage: PipelineStage): boolean {
    const config = this.getConfiguration(configId)
    if (!config) return false

    config.customStages.push(stage)
    config.selectedStages.push(stage.id)
    this.updateConfiguration(config)
    return true
  }

  public updateStageOrder(configId: string, stageIds: string[]): boolean {
    const config = this.getConfiguration(configId)
    if (!config) return false

    // Validate dependencies
    if (!this.validateDependencies(stageIds, configId)) {
      return false
    }

    config.selectedStages = stageIds
    this.updateConfiguration(config)
    return true
  }

  // Progress Management
  public initializeProgress(configId: string): PipelineProgress {
    const config = this.getConfiguration(configId)
    if (!config) throw new Error('Configuration not found')

    const stages = this.getStagesForConfiguration(configId)
    const totalDuration = stages.reduce((sum, stage) => sum + stage.estimatedDuration, 0)

    const progress: PipelineProgress = {
      configurationId: configId,
      completedStages: [],
      currentStage: stages.length > 0 ? stages[0].id : null,
      stageResults: {},
      totalProgress: 0,
      estimatedTimeRemaining: totalDuration
    }

    this.progress.set(configId, progress)
    this.saveToLocalStorage()
    return progress
  }

  public getProgress(configId: string): PipelineProgress | undefined {
    return this.progress.get(configId)
  }

  public updateProgress(configId: string, stageResult: GameStageResult): void {
    const progress = this.getProgress(configId)
    if (!progress) return

    progress.completedStages.push(stageResult.stageId)
    progress.stageResults[stageResult.stageId] = stageResult

    const stages = this.getStagesForConfiguration(configId)
    const nextStages = this.getNextAvailableStages(configId)
    
    progress.currentStage = nextStages.length > 0 ? nextStages[0].id : null
    progress.totalProgress = (progress.completedStages.length / stages.length) * 100

    // Calculate remaining time
    const remainingStages = stages.filter(s => !progress.completedStages.includes(s.id))
    progress.estimatedTimeRemaining = remainingStages.reduce((sum, stage) => sum + stage.estimatedDuration, 0)

    this.progress.set(configId, progress)
    this.saveToLocalStorage()
  }

  // Dependency Management
  public validateDependencies(stageIds: string[], configId: string): boolean {
    const stages = this.getStagesForConfiguration(configId)
    const stageMap = new Map(stages.map(s => [s.id, s]))

    for (let i = 0; i < stageIds.length; i++) {
      const stageId = stageIds[i]
      const stage = stageMap.get(stageId)
      if (!stage) continue

      // Check if all dependencies appear before this stage
      for (const depId of stage.dependencies) {
        const depIndex = stageIds.indexOf(depId)
        if (depIndex === -1 || depIndex >= i) {
          return false // Dependency not found or appears later
        }
      }
    }

    return true
  }

  public getNextAvailableStages(configId: string): PipelineStage[] {
    const progress = this.getProgress(configId)
    const stages = this.getStagesForConfiguration(configId)
    
    if (!progress) return stages.slice(0, 1) // Return first stage if no progress

    return stages.filter(stage => {
      // Skip if already completed
      if (progress.completedStages.includes(stage.id)) return false

      // Check if all dependencies are completed
      return stage.dependencies.every(depId => 
        progress.completedStages.includes(depId)
      )
    })
  }

  public canExecuteStage(stageId: string, configId: string): boolean {
    const nextStages = this.getNextAvailableStages(configId)
    return nextStages.some(stage => stage.id === stageId)
  }

  // Pipeline Execution
  public getExecutionPlan(configId: string): PipelineStage[][] {
    const config = this.getConfiguration(configId)
    const stages = this.getStagesForConfiguration(configId)
    
    if (!config || !config.settings.allowParallelExecution) {
      // Sequential execution
      return stages.map(stage => [stage])
    }

    // Parallel execution plan
    const plan: PipelineStage[][] = []
    const completed = new Set<string>()
    let remaining = [...stages]

    while (remaining.length > 0) {
      const batch = remaining.filter(stage =>
        stage.dependencies.every(depId => completed.has(depId))
      )

      if (batch.length === 0) {
        // Circular dependency or invalid state
        throw new Error('Invalid dependency configuration detected')
      }

      plan.push(batch)
      batch.forEach(stage => {
        completed.add(stage.id)
        remaining = remaining.filter(s => s.id !== stage.id)
      })
    }

    return plan
  }

  // Export/Import
  public exportConfiguration(configId: string): string {
    const config = this.getConfiguration(configId)
    const progress = this.getProgress(configId)
    
    return JSON.stringify({
      configuration: config,
      progress: progress,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2)
  }

  public importConfiguration(data: string): PipelineConfiguration {
    const parsed = JSON.parse(data)
    const config = parsed.configuration as PipelineConfiguration
    
    // Generate new ID to avoid conflicts
    config.id = `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    config.created = new Date()
    config.modified = new Date()
    
    this.configurations.set(config.id, config)
    
    if (parsed.progress) {
      const progress = parsed.progress as PipelineProgress
      progress.configurationId = config.id
      this.progress.set(config.id, progress)
    }
    
    this.saveToLocalStorage()
    return config
  }

  // Persistence
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('pipelineConfigurations', JSON.stringify(
        Array.from(this.configurations.entries())
      ))
      localStorage.setItem('pipelineProgress', JSON.stringify(
        Array.from(this.progress.entries())
      ))
    } catch (error) {
      console.warn('Failed to save pipeline data to localStorage:', error)
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const configData = localStorage.getItem('pipelineConfigurations')
      if (configData) {
        const entries = JSON.parse(configData)
        this.configurations = new Map(entries)
      }

      const progressData = localStorage.getItem('pipelineProgress')
      if (progressData) {
        const entries = JSON.parse(progressData)
        this.progress = new Map(entries)
      }
    } catch (error) {
      console.warn('Failed to load pipeline data from localStorage:', error)
    }
  }

  // Utility Methods
  public getStagesByCategory(configId: string): Record<string, PipelineStage[]> {
    const stages = this.getStagesForConfiguration(configId)
    const grouped: Record<string, PipelineStage[]> = {}

    stages.forEach(stage => {
      if (!grouped[stage.category]) {
        grouped[stage.category] = []
      }
      grouped[stage.category].push(stage)
    })

    return grouped
  }

  public calculateTotalDuration(configId: string): number {
    const stages = this.getStagesForConfiguration(configId)
    return stages.reduce((total, stage) => total + stage.estimatedDuration, 0)
  }

  public getCompletionPercentage(configId: string): number {
    const progress = this.getProgress(configId)
    if (!progress) return 0

    const stages = this.getStagesForConfiguration(configId)
    if (stages.length === 0) return 0

    return (progress.completedStages.length / stages.length) * 100
  }
}