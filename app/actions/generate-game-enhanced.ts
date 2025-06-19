"use server"

import type { GameStageData } from "@/components/game-generator"
import type { PipelineConfig, StageTemplate } from "@/lib/pipeline-config"

// Enhanced stage specifications interface
interface EnhancedStageSpec {
  title: string
  objectives: string[]
  features: string[]
  technicalRequirements: string[]
  userExperience: string[]
  improvements: string[]
  dependencies: string[]
  complexity: 'low' | 'medium' | 'high'
  estimatedDuration: string
  validationCriteria: string[]
}

// Generate specifications for a stage using the pipeline configuration
async function generateEnhancedStageSpec(
  stageTemplate: StageTemplate,
  stageIndex: number,
  theme: string,
  previousStages: GameStageData[],
  pipelineConfig: PipelineConfig,
  apiKey: string,
): Promise<EnhancedStageSpec> {
  try {
    let prompt = `You are an expert HTML5 game designer creating specifications for a web-based game following a ${pipelineConfig.totalStages}-stage pipeline.

Game theme: ${theme}
Pipeline: ${pipelineConfig.name} - ${pipelineConfig.description}

CURRENT STAGE TEMPLATE:
Stage ${stageIndex + 1}: ${stageTemplate.name}
Description: ${stageTemplate.description}
Estimated Complexity: ${stageTemplate.estimatedComplexity}

STAGE OBJECTIVES:
${stageTemplate.objectives.map((obj) => `- ${obj}`).join("\n")}

FOCUS AREAS:
${stageTemplate.focus.map((focus) => `- ${focus}`).join("\n")}

REQUIREMENTS:
${stageTemplate.requirements.map((req) => `- ${req}`).join("\n")}
`

    // Add context from previous stages
    if (previousStages.length > 0) {
      prompt += `\nPREVIOUS STAGES CONTEXT:\n`
      previousStages.forEach((stage, idx) => {
        prompt += `\nStage ${idx + 1}: ${stage.title}\n- ${stage.description}\n`
      })
      
      const latestStage = previousStages[previousStages.length - 1]
      if (latestStage.md) {
        prompt += `\nLatest Stage Documentation:\n${latestStage.md.substring(0, 1000)}...\n`
      }
    }

    // Add dependency information
    if (stageTemplate.dependencies && stageTemplate.dependencies.length > 0) {
      prompt += `\nSTAGE DEPENDENCIES:\n`
      stageTemplate.dependencies.forEach(depId => {
        const depStage = pipelineConfig.stages.find(s => s.id === depId)
        if (depStage) {
          prompt += `- Builds upon: ${depStage.name} (${depStage.description})\n`
        }
      })
    }

    // Complexity-specific guidance
    switch (stageTemplate.estimatedComplexity) {
      case 'low':
        prompt += `\nCOMPLEXITY GUIDANCE (Low):
- Focus on simple, straightforward implementations
- Prioritize clarity and basic functionality
- Avoid over-engineering
- Ensure stable foundation for future stages`
        break
      case 'medium':
        prompt += `\nCOMPLEXITY GUIDANCE (Medium):
- Balance functionality with implementation complexity
- Add meaningful features that enhance gameplay
- Consider user experience improvements
- Prepare for more advanced features in later stages`
        break
      case 'high':
        prompt += `\nCOMPLEXITY GUIDANCE (High):
- Implement sophisticated features and algorithms
- Focus on advanced gameplay mechanics
- Optimize for performance and scalability
- Create compelling and engaging experiences`
        break
    }

    prompt += `\nGenerate detailed specifications for this stage that will guide the code implementation.
Consider the pipeline context, stage dependencies, and complexity level.

Return your response in the following JSON format:
{
  "title": "Enhanced Game Title - Stage ${stageIndex + 1}",
  "objectives": ["Primary objective 1", "Primary objective 2", ...],
  "features": ["Feature to implement 1", "Feature to implement 2", ...],
  "technicalRequirements": ["Technical requirement 1", "Technical requirement 2", ...],
  "userExperience": ["UX consideration 1", "UX consideration 2", ...],
  "improvements": ["Improvement over previous stage 1", "Improvement over previous stage 2", ...],
  "dependencies": ["Dependency description 1", "Dependency description 2", ...],
  "complexity": "${stageTemplate.estimatedComplexity}",
  "estimatedDuration": "Estimated time to implement",
  "validationCriteria": ["Validation criteria 1", "Validation criteria 2", ...]
}

Ensure specifications are:
- Specific and actionable
- Aligned with the pipeline stage template
- Building appropriately on previous stages
- Suitable for browser-based games
- Focused on creating engaging gameplay`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert game designer specializing in multi-stage HTML5 game development pipelines. You create detailed, practical specifications that guide successful implementation.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || `API error (${response.status})`
      console.error("OpenAI API error details:", errorData)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("Failed to generate enhanced stage specifications")
    }

    console.log("Generated enhanced specifications:", content)
    return JSON.parse(content) as EnhancedStageSpec
  } catch (error: any) {
    console.error("Error generating enhanced stage specifications:", error)
    throw new Error(`Failed to generate enhanced stage specifications: ${error.message}`)
  }
}

// Main function to generate a game stage with pipeline support
export async function generateEnhancedGameStage(
  stageTemplate: StageTemplate,
  stageIndex: number,
  theme: string,
  previousStages: GameStageData[],
  pipelineConfig: PipelineConfig,
  apiKey: string,
): Promise<GameStageData> {
  if (!apiKey || typeof apiKey !== "string") {
    return {
      title: "API Key Missing",
      description: "Please provide a valid OpenAI API key to generate game stages.",
      html: `<div class="error-container"><h2>API Key Required</h2><p>Please enter your OpenAI API key to start generating your game.</p></div>`,
      css: `.error-container { color: red; text-align: center; padding: 2rem; }`,
      js: `console.error("No API key provided");`,
      md: "# Game Documentation\n\nAPI Key is required to generate game content.",
      id: `error-${Date.now()}`,
    }
  }

  try {
    // Step 1: Generate enhanced specifications
    console.log(`Generating enhanced specifications for stage ${stageIndex + 1} (${stageTemplate.name})...`)
    const stageSpec = await generateEnhancedStageSpec(stageTemplate, stageIndex, theme, previousStages, pipelineConfig, apiKey)
    console.log("Enhanced stage specifications generated:", stageSpec)

    // Step 2: Generate game code based on specifications
    console.log(`Generating game code for stage ${stageIndex + 1}...`)

    let codePrompt = `You are an expert HTML5 game developer implementing a ${pipelineConfig.totalStages}-stage game development pipeline.

PIPELINE CONTEXT:
Pipeline: ${pipelineConfig.name}
Stage ${stageIndex + 1}/${pipelineConfig.totalStages}: ${stageTemplate.name}
Complexity: ${stageSpec.complexity}
Estimated Duration: ${stageSpec.estimatedDuration}

GAME THEME: ${theme}

ENHANCED SPECIFICATIONS:
Title: ${stageSpec.title}

Objectives:
${stageSpec.objectives.map((obj) => `- ${obj}`).join("\n")}

Features to Implement:
${stageSpec.features.map((feat) => `- ${feat}`).join("\n")}

Technical Requirements:
${stageSpec.technicalRequirements.map((req) => `- ${req}`).join("\n")}

User Experience Focus:
${stageSpec.userExperience.map((ux) => `- ${ux}`).join("\n")}

Key Improvements:
${stageSpec.improvements.map((imp) => `- ${imp}`).join("\n")}

Dependencies:
${stageSpec.dependencies.map((dep) => `- ${dep}`).join("\n")}

Validation Criteria:
${stageSpec.validationCriteria.map((crit) => `- ${crit}`).join("\n")}

CRITICAL IMPLEMENTATION REQUIREMENTS:
1. MUST work in iframe AND standalone browser environments
2. Use document.addEventListener('DOMContentLoaded', ...) for initialization
3. Target container: div with id="game-container"
4. No external dependencies (self-contained)
5. Responsive design for all screen sizes
6. Comprehensive error handling and debugging
7. Performance optimized for browser games
8. Mobile-friendly touch and mouse support
9. Accessibility considerations
10. Clean, maintainable code structure

PIPELINE STAGE REQUIREMENTS:
${stageTemplate.estimatedComplexity === 'low' ? 
  '- Simple, stable implementation\n- Clear code structure\n- Basic functionality focus' :
  stageTemplate.estimatedComplexity === 'medium' ?
  '- Balanced feature implementation\n- Good user experience\n- Moderate complexity' :
  '- Advanced features and algorithms\n- Sophisticated mechanics\n- High-quality implementation'
}
`

    // Add previous stage context
    if (previousStages.length > 0) {
      const latestStage = previousStages[previousStages.length - 1]
      codePrompt += `\nPREVIOUS STAGE CODE (Build upon this):

HTML:
\`\`\`html
${latestStage.html}
\`\`\`

CSS:
\`\`\`css
${latestStage.css}
\`\`\`

JavaScript:
\`\`\`javascript
${latestStage.js}
\`\`\`

IMPORTANT: Enhance and build upon this existing code. Do not start from scratch.
Maintain existing functionality while adding the new features specified above.
`
    }

    codePrompt += `\nGenerate the complete game implementation in the following JSON format:
{
  "title": "Game Title",
  "description": "Brief description of the game and stage implementation",
  "html": "Complete HTML structure (body content only)",
  "css": "Complete CSS stylesheet",
  "js": "Complete JavaScript implementation",
  "md": "# Stage Documentation\\n\\nDetailed markdown documentation"
}

FINAL VALIDATION CHECKLIST:
✓ Works in both iframe and standalone environments
✓ Properly initializes with DOMContentLoaded
✓ All game elements are visible and properly positioned
✓ Interactive elements respond correctly
✓ Mobile-friendly touch support
✓ Console logging for debugging
✓ Error handling implemented
✓ Performance optimized
✓ Meets all validation criteria listed above
✓ Builds appropriately on previous stages

Generate clean, production-ready code that fulfills all specifications and requirements.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert HTML5 game developer specializing in multi-stage pipeline development. You write clean, efficient, and well-documented code that works reliably across all browser environments.",
          },
          { role: "user", content: codePrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || `API error (${response.status})`
      console.error("OpenAI API error details:", errorData)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("Failed to generate enhanced game stage")
    }

    try {
      const parsedResponse = JSON.parse(content) as GameStageData
      
      // Enhanced markdown documentation
      parsedResponse.md = `# ${parsedResponse.title}

${parsedResponse.description}

## Stage ${stageIndex + 1} Implementation Details

### Pipeline Context
- **Pipeline**: ${pipelineConfig.name}
- **Stage**: ${stageTemplate.name}
- **Complexity**: ${stageSpec.complexity}
- **Estimated Duration**: ${stageSpec.estimatedDuration}

### Objectives Achieved
${stageSpec.objectives.map((obj) => `- ${obj}`).join("\n")}

### Features Implemented
${stageSpec.features.map((feat) => `- ${feat}`).join("\n")}

### Technical Implementation
${stageSpec.technicalRequirements.map((req) => `- ${req}`).join("\n")}

### User Experience Enhancements
${stageSpec.userExperience.map((ux) => `- ${ux}`).join("\n")}

### Improvements Over Previous Stage
${stageSpec.improvements.map((imp) => `- ${imp}`).join("\n")}

### Validation Criteria Met
${stageSpec.validationCriteria.map((crit) => `- ✓ ${crit}`).join("\n")}

${stageSpec.dependencies.length > 0 ? `### Dependencies
${stageSpec.dependencies.map((dep) => `- ${dep}`).join("\n")}` : ''}

## Implementation Notes

${parsedResponse.md.split("# ")[1]?.split("\n\n").slice(1).join("\n\n") || ""}`

      // Add unique ID
      parsedResponse.id = `${stageTemplate.id}-${Date.now()}`
      console.log("Generated enhanced game with ID:", parsedResponse.id)

      return parsedResponse
    } catch (error) {
      console.error("Failed to parse OpenAI response:", content)
      throw new Error("Failed to parse enhanced game stage data")
    }
  } catch (error: any) {
    console.error("Error in generateEnhancedGameStage:", error)
    return {
      title: `Error in ${stageTemplate.name}`,
      description: `There was an error generating stage ${stageIndex + 1}: ${error.message}`,
      html: `<div class="error-container"><h2>Error Generating Stage</h2><p>Error in ${stageTemplate.name}: ${error.message}</p></div>`,
      css: `.error-container { color: red; text-align: center; padding: 2rem; }`,
      js: `console.error("Failed to generate enhanced game stage: ${error.message}");`,
      md: `# Error in ${stageTemplate.name}\n\nThere was an error generating this stage: ${error.message}`,
      id: `error-${stageTemplate.id}-${Date.now()}`,
    }
  }
}

// Backward compatibility function
export async function generateGameStageWithPipeline(
  stageNumber: number,
  theme: string,
  previousStages: GameStageData[],
  apiKey: string,
  pipelineConfig?: PipelineConfig
): Promise<GameStageData> {
  // Use default pipeline if none provided (backward compatibility)
  if (!pipelineConfig) {
    const { generateGameStage } = await import("./generate-game")
    return generateGameStage(stageNumber, theme, previousStages, apiKey)
  }

  const stageTemplate = pipelineConfig.stages[stageNumber]
  if (!stageTemplate) {
    throw new Error(`Invalid stage number ${stageNumber} for pipeline ${pipelineConfig.name}`)
  }

  return generateEnhancedGameStage(stageTemplate, stageNumber, theme, previousStages, pipelineConfig, apiKey)
}