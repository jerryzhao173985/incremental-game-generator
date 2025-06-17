// Pipeline Configuration System
// Supports dynamic multi-stage pipeline with configurable stages

export interface StageTemplate {
  id: string
  name: string
  description: string
  objectives: string[]
  focus: string[]
  requirements: string[]
  dependencies?: string[]
  isOptional?: boolean
  estimatedComplexity: 'low' | 'medium' | 'high'
}

export interface PipelineConfig {
  id: string
  name: string
  description: string
  totalStages: number
  stages: StageTemplate[]
  allowCustomStages: boolean
  maxStages: number
  minStages: number
}

// Default 5-stage pipeline (backward compatible)
export const DEFAULT_5_STAGE_PIPELINE: PipelineConfig = {
  id: 'classic-5-stage',
  name: 'Classic 5-Stage Pipeline',
  description: 'The original 5-stage incremental game development pipeline',
  totalStages: 5,
  minStages: 5,
  maxStages: 5,
  allowCustomStages: false,
  stages: [
    {
      id: 'core-concept',
      name: 'Core Concept',
      description: 'Initial game concept with core structure and basic functionality',
      objectives: [
        'Establish basic game structure',
        'Implement core mechanics',
        'Create essential UI elements',
        'Set up fundamental gameplay loop'
      ],
      focus: [
        'Basic game structure and core mechanics',
        'Essential UI elements and controls',
        'Fundamental gameplay loop',
        'Visual identity related to the theme',
        'Responsive design for iframe environments'
      ],
      requirements: [
        'DOMContentLoaded initialization',
        'Basic event handling',
        'Console logging for debugging',
        'Responsive container layout'
      ],
      estimatedComplexity: 'medium'
    },
    {
      id: 'enhanced-mechanics',
      name: 'Enhanced Mechanics',
      description: 'Enhanced gameplay mechanics and primary user interactions',
      objectives: [
        'Expand core gameplay mechanics',
        'Improve user interactions',
        'Add progression systems',
        'Enhance visual feedback'
      ],
      focus: [
        'Enhanced game mechanics with more depth',
        'Improved user interactions and controls',
        'Game progression systems',
        'Additional visual elements and feedback',
        'Better responsiveness and mobile support'
      ],
      requirements: [
        'Enhanced interaction handling',
        'Progress tracking systems',
        'Visual feedback mechanisms',
        'Mobile touch support'
      ],
      dependencies: ['core-concept'],
      estimatedComplexity: 'medium'
    },
    {
      id: 'complete-game',
      name: 'Complete Game',
      description: 'Complete core features with polished visuals and user experience',
      objectives: [
        'Complete all core game mechanics',
        'Polish user interface design',
        'Implement full game loop',
        'Add refined visuals and animations'
      ],
      focus: [
        'Complete game mechanics and systems',
        'Polished user interface with clear feedback',
        'Full game loop (start, play, end/restart)',
        'Refined visuals with animations',
        'Sound effects or visual cues for actions'
      ],
      requirements: [
        'Complete game state management',
        'Animation systems',
        'Audio/visual feedback',
        'Game loop implementation'
      ],
      dependencies: ['enhanced-mechanics'],
      estimatedComplexity: 'high'
    },
    {
      id: 'advanced-features',
      name: 'Advanced Features',
      description: 'Advanced features and algorithmic complexity',
      objectives: [
        'Implement advanced game mechanics',
        'Add sophisticated scoring systems',
        'Create special effects',
        'Introduce additional game modes'
      ],
      focus: [
        'Advanced game mechanics or algorithms',
        'Sophisticated scoring or achievement systems',
        'Special effects or advanced animations',
        'Additional game modes or challenges',
        'Enhanced user experience features'
      ],
      requirements: [
        'Complex algorithm implementation',
        'Advanced animation systems',
        'Multiple game modes',
        'Achievement systems'
      ],
      dependencies: ['complete-game'],
      estimatedComplexity: 'high'
    },
    {
      id: 'final-polish',
      name: 'Final Polish',
      description: 'Final polish with optimizations and special effects',
      objectives: [
        'Apply final visual polish',
        'Optimize performance',
        'Add special features and easter eggs',
        'Perfect game balance'
      ],
      focus: [
        'Final visual polish and special effects',
        'Performance optimizations',
        'Easter eggs or special features',
        'Final balance adjustments',
        'Quality-of-life improvements'
      ],
      requirements: [
        'Performance optimization',
        'Visual polish systems',
        'Special feature implementation',
        'Balance testing'
      ],
      dependencies: ['advanced-features'],
      estimatedComplexity: 'medium'
    }
  ]
}

// Extended 10-stage pipeline for more detailed development
export const EXTENDED_10_STAGE_PIPELINE: PipelineConfig = {
  id: 'extended-10-stage',
  name: 'Extended 10-Stage Pipeline',
  description: 'Comprehensive 10-stage pipeline for detailed game development',
  totalStages: 10,
  minStages: 8,
  maxStages: 12,
  allowCustomStages: true,
  stages: [
    {
      id: 'concept-foundation',
      name: 'Concept Foundation',
      description: 'Basic concept and foundation setup',
      objectives: ['Establish game concept', 'Create basic structure', 'Set up development foundation'],
      focus: ['Core game idea', 'Basic HTML structure', 'Initial styling'],
      requirements: ['Basic HTML/CSS/JS setup', 'Theme integration'],
      estimatedComplexity: 'low'
    },
    {
      id: 'core-mechanics',
      name: 'Core Mechanics',
      description: 'Implement fundamental game mechanics',
      objectives: ['Build core gameplay', 'Add basic interactions', 'Create initial UI'],
      focus: ['Primary game mechanics', 'User input handling', 'Basic UI elements'],
      requirements: ['Event handling', 'Game state management', 'User interface'],
      dependencies: ['concept-foundation'],
      estimatedComplexity: 'medium'
    },
    {
      id: 'interaction-systems',
      name: 'Interaction Systems',
      description: 'Enhanced user interaction and feedback',
      objectives: ['Improve user interactions', 'Add feedback systems', 'Enhance responsiveness'],
      focus: ['Advanced interactions', 'Visual feedback', 'Mobile support'],
      requirements: ['Touch/mouse events', 'Feedback systems', 'Responsive design'],
      dependencies: ['core-mechanics'],
      estimatedComplexity: 'medium'
    },
    {
      id: 'progression-systems',
      name: 'Progression Systems',
      description: 'Game progression and advancement mechanics',
      objectives: ['Add progression systems', 'Create advancement mechanics', 'Implement rewards'],
      focus: ['Player progression', 'Unlock systems', 'Achievement mechanics'],
      requirements: ['Progress tracking', 'Save systems', 'Reward mechanisms'],
      dependencies: ['interaction-systems'],
      estimatedComplexity: 'medium'
    },
    {
      id: 'visual-polish',
      name: 'Visual Polish',
      description: 'Enhanced visuals and animations',
      objectives: ['Improve visual design', 'Add animations', 'Enhance aesthetics'],
      focus: ['Visual design', 'Animation systems', 'UI polish'],
      requirements: ['CSS animations', 'Visual effects', 'Design consistency'],
      dependencies: ['progression-systems'],
      estimatedComplexity: 'medium'
    },
    {
      id: 'complete-gameplay',
      name: 'Complete Gameplay',
      description: 'Full gameplay loop and core features',
      objectives: ['Complete game loop', 'Finalize core features', 'Ensure full functionality'],
      focus: ['Complete game experience', 'Full feature set', 'Game balance'],
      requirements: ['Complete game loop', 'All core features', 'Testing and validation'],
      dependencies: ['visual-polish'],
      estimatedComplexity: 'high'
    },
    {
      id: 'advanced-algorithms',
      name: 'Advanced Algorithms',
      description: 'Complex algorithms and sophisticated mechanics',
      objectives: ['Implement complex systems', 'Add algorithmic depth', 'Create sophisticated features'],
      focus: ['Advanced algorithms', 'Complex systems', 'Sophisticated mechanics'],
      requirements: ['Algorithm implementation', 'Complex logic', 'Performance considerations'],
      dependencies: ['complete-gameplay'],
      estimatedComplexity: 'high'
    },
    {
      id: 'special-features',
      name: 'Special Features',
      description: 'Unique features and special mechanics',
      objectives: ['Add unique features', 'Create special mechanics', 'Implement extras'],
      focus: ['Unique gameplay elements', 'Special features', 'Innovation'],
      requirements: ['Creative implementation', 'Feature integration', 'Uniqueness'],
      dependencies: ['advanced-algorithms'],
      estimatedComplexity: 'high'
    },
    {
      id: 'optimization',
      name: 'Optimization',
      description: 'Performance optimization and refinement',
      objectives: ['Optimize performance', 'Refine systems', 'Improve efficiency'],
      focus: ['Performance tuning', 'Code optimization', 'Efficiency improvements'],
      requirements: ['Performance analysis', 'Code optimization', 'Testing'],
      dependencies: ['special-features'],
      estimatedComplexity: 'medium'
    },
    {
      id: 'final-touches',
      name: 'Final Touches',
      description: 'Final polish and special touches',
      objectives: ['Add final polish', 'Perfect user experience', 'Add special touches'],
      focus: ['Final polish', 'User experience perfection', 'Special details'],
      requirements: ['Final testing', 'Polish implementation', 'Quality assurance'],
      dependencies: ['optimization'],
      estimatedComplexity: 'medium'
    }
  ]
}

// Flexible custom pipeline template
export const CUSTOM_PIPELINE_TEMPLATE: PipelineConfig = {
  id: 'custom-flexible',
  name: 'Custom Flexible Pipeline',
  description: 'Fully customizable pipeline with user-defined stages',
  totalStages: 8,
  minStages: 3,
  maxStages: 20,
  allowCustomStages: true,
  stages: []
}

// Available pipeline configurations
export const AVAILABLE_PIPELINES = [
  DEFAULT_5_STAGE_PIPELINE,
  EXTENDED_10_STAGE_PIPELINE,
  CUSTOM_PIPELINE_TEMPLATE
]

// Utility functions for pipeline management
export class PipelineManager {
  private config: PipelineConfig

  constructor(config: PipelineConfig) {
    this.config = config
  }

  validatePipeline(): boolean {
    if (this.config.stages.length < this.config.minStages) return false
    if (this.config.stages.length > this.config.maxStages) return false
    
    // Check dependencies
    const stageIds = new Set(this.config.stages.map(s => s.id))
    for (const stage of this.config.stages) {
      if (stage.dependencies) {
        for (const dep of stage.dependencies) {
          if (!stageIds.has(dep)) return false
        }
      }
    }
    
    return true
  }

  getStageById(id: string): StageTemplate | undefined {
    return this.config.stages.find(stage => stage.id === id)
  }

  getStageByIndex(index: number): StageTemplate | undefined {
    return this.config.stages[index]
  }

  getNextStages(currentStageId: string): StageTemplate[] {
    const currentIndex = this.config.stages.findIndex(s => s.id === currentStageId)
    if (currentIndex === -1) return []
    
    const nextStages: StageTemplate[] = []
    for (let i = currentIndex + 1; i < this.config.stages.length; i++) {
      const stage = this.config.stages[i]
      if (!stage.dependencies || stage.dependencies.includes(currentStageId)) {
        nextStages.push(stage)
      }
    }
    
    return nextStages
  }

  calculateProgress(completedStages: string[]): number {
    return (completedStages.length / this.config.totalStages) * 100
  }

  getEstimatedTimeRemaining(completedStages: string[]): string {
    const remaining = this.config.stages.filter(s => !completedStages.includes(s.id))
    const complexity = remaining.reduce((acc, stage) => {
      const multiplier = stage.estimatedComplexity === 'low' ? 1 : 
                       stage.estimatedComplexity === 'medium' ? 2 : 3
      return acc + multiplier
    }, 0)
    
    const estimatedMinutes = complexity * 3 // Rough estimate
    return `~${estimatedMinutes} minutes`
  }
}

// Default pipeline instance
export const defaultPipelineManager = new PipelineManager(DEFAULT_5_STAGE_PIPELINE)