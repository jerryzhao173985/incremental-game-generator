// Pipeline Configuration Types for Multi-Stage Game Generation

export interface PipelineStage {
  id: string
  name: string
  description: string
  objectives: string[]
  features: string[]
  technicalRequirements: string[]
  userExperience: string[]
  improvements: string[]
  dependencies: string[] // IDs of stages that must be completed first
  estimatedDuration: number // in minutes
  category: 'core' | 'visual' | 'audio' | 'optimization' | 'testing' | 'polish'
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface PipelineTemplate {
  id: string
  name: string
  description: string
  stages: PipelineStage[]
  metadata: {
    totalEstimatedDuration: number
    minStages: number
    maxStages: number
    gameTypes: string[]
  }
}

export interface PipelineConfiguration {
  id: string
  name: string
  description: string
  theme: string
  selectedStages: string[] // stage IDs in execution order
  customStages: PipelineStage[]
  settings: {
    allowParallelExecution: boolean
    autoSave: boolean
    enableBranching: boolean
    maxIterations: number
  }
  created: Date
  modified: Date
}

export interface PipelineProgress {
  configurationId: string
  completedStages: string[]
  currentStage: string | null
  stageResults: Record<string, GameStageResult>
  totalProgress: number
  estimatedTimeRemaining: number
}

export interface GameStageResult {
  stageId: string
  title: string
  description: string
  html: string
  css: string
  js: string
  md?: string
  id?: string
  completedAt: Date
  duration: number
  success: boolean
  errors?: string[]
}

// Pre-built Pipeline Templates
export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    id: 'classic-five-stage',
    name: 'Classic Five-Stage Pipeline',
    description: 'The original five-stage pipeline for comprehensive game development',
    stages: [
      {
        id: 'core-concept',
        name: 'Core Concept',
        description: 'Initial game concept with core structure and basic functionality',
        objectives: [
          'Establish game foundation',
          'Implement basic gameplay loop',
          'Create essential UI elements'
        ],
        features: [
          'Basic game structure',
          'Core mechanics',
          'Essential controls',
          'Visual identity'
        ],
        technicalRequirements: [
          'HTML5 canvas or DOM structure',
          'Responsive design',
          'Event handling',
          'Basic state management'
        ],
        userExperience: [
          'Clear game objective',
          'Intuitive controls',
          'Immediate feedback',
          'Playable prototype'
        ],
        improvements: [
          'Foundation for all future stages'
        ],
        dependencies: [],
        estimatedDuration: 15,
        category: 'core',
        priority: 'critical'
      },
      {
        id: 'enhanced-mechanics',
        name: 'Enhanced Mechanics',
        description: 'Enhanced gameplay mechanics and primary user interactions',
        objectives: [
          'Expand core gameplay',
          'Add progression systems',
          'Improve user interactions'
        ],
        features: [
          'Enhanced game mechanics',
          'Progression systems',
          'Improved controls',
          'Additional visual elements'
        ],
        technicalRequirements: [
          'Advanced state management',
          'Animation systems',
          'Data persistence',
          'Mobile compatibility'
        ],
        userExperience: [
          'Engaging progression',
          'Responsive controls',
          'Visual feedback',
          'Clear goals'
        ],
        improvements: [
          'More complex interactions',
          'Better game flow',
          'Enhanced visuals'
        ],
        dependencies: ['core-concept'],
        estimatedDuration: 20,
        category: 'core',
        priority: 'critical'
      },
      {
        id: 'complete-game',
        name: 'Complete Game',
        description: 'Complete core features with polished visuals and user experience',
        objectives: [
          'Complete game loop',
          'Polish user interface',
          'Refine all systems'
        ],
        features: [
          'Full game mechanics',
          'Polished UI',
          'Complete game states',
          'Animations and effects'
        ],
        technicalRequirements: [
          'Complete state machine',
          'Performance optimization',
          'Error handling',
          'Save/load functionality'
        ],
        userExperience: [
          'Polished experience',
          'Clear feedback',
          'Smooth transitions',
          'Consistent design'
        ],
        improvements: [
          'Professional appearance',
          'Complete functionality',
          'Refined gameplay'
        ],
        dependencies: ['enhanced-mechanics'],
        estimatedDuration: 25,
        category: 'core',
        priority: 'critical'
      },
      {
        id: 'advanced-features',
        name: 'Advanced Features',
        description: 'Advanced features and algorithmic complexity',
        objectives: [
          'Add sophisticated features',
          'Implement advanced algorithms',
          'Create additional game modes'
        ],
        features: [
          'Complex algorithms',
          'Advanced scoring systems',
          'Special effects',
          'Multiple game modes'
        ],
        technicalRequirements: [
          'Algorithm optimization',
          'Advanced graphics',
          'Complex data structures',
          'Performance monitoring'
        ],
        userExperience: [
          'Rich feature set',
          'Advanced interactions',
          'Varied gameplay',
          'Expert-level content'
        ],
        improvements: [
          'Sophisticated gameplay',
          'Advanced features',
          'Enhanced complexity'
        ],
        dependencies: ['complete-game'],
        estimatedDuration: 30,
        category: 'polish',
        priority: 'high'
      },
      {
        id: 'final-polish',
        name: 'Final Polish',
        description: 'Final polish with optimizations and special effects',
        objectives: [
          'Perfect the experience',
          'Optimize performance',
          'Add final touches'
        ],
        features: [
          'Visual polish',
          'Performance optimizations',
          'Special effects',
          'Quality of life features'
        ],
        technicalRequirements: [
          'Code optimization',
          'Asset optimization',
          'Cross-browser testing',
          'Accessibility features'
        ],
        userExperience: [
          'Seamless experience',
          'Professional polish',
          'Exceptional quality',
          'Memorable moments'
        ],
        improvements: [
          'Perfect experience',
          'Optimal performance',
          'Special touches'
        ],
        dependencies: ['advanced-features'],
        estimatedDuration: 20,
        category: 'polish',
        priority: 'medium'
      }
    ],
    metadata: {
      totalEstimatedDuration: 110,
      minStages: 3,
      maxStages: 5,
      gameTypes: ['all']
    }
  },
  {
    id: 'rapid-prototype',
    name: 'Rapid Prototype Pipeline',
    description: 'Fast track pipeline for quick game prototyping',
    stages: [
      {
        id: 'prototype-core',
        name: 'Prototype Core',
        description: 'Minimal viable game prototype',
        objectives: [
          'Create playable prototype',
          'Validate core concept',
          'Test basic mechanics'
        ],
        features: [
          'Basic gameplay',
          'Simple controls',
          'Core mechanics',
          'Minimal UI'
        ],
        technicalRequirements: [
          'Simple HTML structure',
          'Basic CSS styling',
          'Essential JavaScript',
          'Quick setup'
        ],
        userExperience: [
          'Playable concept',
          'Clear objective',
          'Immediate feedback'
        ],
        improvements: [
          'Proof of concept'
        ],
        dependencies: [],
        estimatedDuration: 10,
        category: 'core',
        priority: 'critical'
      },
      {
        id: 'prototype-polish',
        name: 'Prototype Polish',
        description: 'Basic polish for prototype presentation',
        objectives: [
          'Improve visual appeal',
          'Enhance usability',
          'Fix critical issues'
        ],
        features: [
          'Improved visuals',
          'Better controls',
          'Basic polish',
          'Bug fixes'
        ],
        technicalRequirements: [
          'Improved styling',
          'Better interaction',
          'Error handling',
          'Responsive design'
        ],
        userExperience: [
          'Polished prototype',
          'Good first impression',
          'Smooth interaction'
        ],
        improvements: [
          'Professional appearance',
          'Better usability'
        ],
        dependencies: ['prototype-core'],
        estimatedDuration: 15,
        category: 'polish',
        priority: 'high'
      }
    ],
    metadata: {
      totalEstimatedDuration: 25,
      minStages: 1,
      maxStages: 2,
      gameTypes: ['prototype', 'concept']
    }
  },
  {
    id: 'comprehensive-development',
    name: 'Comprehensive Development Pipeline',
    description: 'Extended pipeline with parallel tracks for complex games',
    stages: [
      {
        id: 'foundation',
        name: 'Foundation',
        description: 'Core game foundation and architecture',
        objectives: [
          'Establish architecture',
          'Create core systems',
          'Set up infrastructure'
        ],
        features: [
          'Game architecture',
          'Core systems',
          'Basic framework',
          'Development tools'
        ],
        technicalRequirements: [
          'Modular architecture',
          'Scalable design',
          'Development setup',
          'Testing framework'
        ],
        userExperience: [
          'Stable foundation',
          'Consistent behavior'
        ],
        improvements: [
          'Robust foundation'
        ],
        dependencies: [],
        estimatedDuration: 20,
        category: 'core',
        priority: 'critical'
      },
      {
        id: 'gameplay-core',
        name: 'Gameplay Core',
        description: 'Core gameplay mechanics and systems',
        objectives: [
          'Implement core mechanics',
          'Create game loop',
          'Add player interactions'
        ],
        features: [
          'Core mechanics',
          'Game loop',
          'Player controls',
          'Basic AI'
        ],
        technicalRequirements: [
          'Game logic',
          'Input handling',
          'State management',
          'Physics if needed'
        ],
        userExperience: [
          'Engaging gameplay',
          'Responsive controls',
          'Clear objectives'
        ],
        improvements: [
          'Fun core gameplay'
        ],
        dependencies: ['foundation'],
        estimatedDuration: 30,
        category: 'core',
        priority: 'critical'
      },
      {
        id: 'visual-design',
        name: 'Visual Design',
        description: 'Visual design and graphics implementation',
        objectives: [
          'Create visual identity',
          'Implement graphics',
          'Design UI elements'
        ],
        features: [
          'Visual theme',
          'Graphics assets',
          'UI design',
          'Animations'
        ],
        technicalRequirements: [
          'CSS animations',
          'Canvas graphics',
          'Responsive design',
          'Asset management'
        ],
        userExperience: [
          'Appealing visuals',
          'Consistent design',
          'Smooth animations'
        ],
        improvements: [
          'Professional appearance'
        ],
        dependencies: ['foundation'],
        estimatedDuration: 25,
        category: 'visual',
        priority: 'high'
      },
      {
        id: 'audio-implementation',
        name: 'Audio Implementation',
        description: 'Sound effects and audio feedback',
        objectives: [
          'Add sound effects',
          'Implement audio feedback',
          'Create audio atmosphere'
        ],
        features: [
          'Sound effects',
          'Background music',
          'Audio feedback',
          'Volume controls'
        ],
        technicalRequirements: [
          'Web Audio API',
          'Audio asset management',
          'Performance optimization',
          'Browser compatibility'
        ],
        userExperience: [
          'Immersive audio',
          'Clear feedback',
          'Atmospheric sound'
        ],
        improvements: [
          'Enhanced immersion'
        ],
        dependencies: ['foundation'],
        estimatedDuration: 20,
        category: 'audio',
        priority: 'medium'
      },
      {
        id: 'integration',
        name: 'Integration',
        description: 'Integrate all systems and features',
        objectives: [
          'Combine all systems',
          'Test integration',
          'Fix compatibility issues'
        ],
        features: [
          'System integration',
          'Feature combination',
          'Performance optimization',
          'Bug fixes'
        ],
        technicalRequirements: [
          'System compatibility',
          'Performance testing',
          'Error handling',
          'Code optimization'
        ],
        userExperience: [
          'Seamless experience',
          'Stable performance',
          'Integrated features'
        ],
        improvements: [
          'Unified experience'
        ],
        dependencies: ['gameplay-core', 'visual-design', 'audio-implementation'],
        estimatedDuration: 25,
        category: 'optimization',
        priority: 'critical'
      },
      {
        id: 'testing-refinement',
        name: 'Testing & Refinement',
        description: 'Comprehensive testing and refinement',
        objectives: [
          'Test all features',
          'Refine gameplay',
          'Optimize performance'
        ],
        features: [
          'Comprehensive testing',
          'Gameplay refinement',
          'Performance optimization',
          'Bug fixes'
        ],
        technicalRequirements: [
          'Automated testing',
          'Performance monitoring',
          'Error tracking',
          'Optimization'
        ],
        userExperience: [
          'Polished experience',
          'Stable performance',
          'Refined gameplay'
        ],
        improvements: [
          'Quality assurance'
        ],
        dependencies: ['integration'],
        estimatedDuration: 20,
        category: 'testing',
        priority: 'high'
      },
      {
        id: 'final-polish',
        name: 'Final Polish',
        description: 'Final polish and special touches',
        objectives: [
          'Add final touches',
          'Perfect the experience',
          'Add special features'
        ],
        features: [
          'Final polish',
          'Special effects',
          'Easter eggs',
          'Quality of life features'
        ],
        technicalRequirements: [
          'Advanced effects',
          'Code cleanup',
          'Documentation',
          'Deployment prep'
        ],
        userExperience: [
          'Exceptional quality',
          'Memorable experience',
          'Professional finish'
        ],
        improvements: [
          'Perfect experience'
        ],
        dependencies: ['testing-refinement'],
        estimatedDuration: 15,
        category: 'polish',
        priority: 'medium'
      }
    ],
    metadata: {
      totalEstimatedDuration: 155,
      minStages: 4,
      maxStages: 7,
      gameTypes: ['complex', 'commercial', 'professional']
    }
  }
]

export const DEFAULT_PIPELINE_SETTINGS = {
  allowParallelExecution: false,
  autoSave: true,
  enableBranching: false,
  maxIterations: 10
}