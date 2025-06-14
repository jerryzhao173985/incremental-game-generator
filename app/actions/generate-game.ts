"use server"

import type { GameStageData } from "@/components/game-generator"
import type { GameTemplate } from "@/lib/templates"

// Interface for stage specifications
interface StageSpec {
  title: string
  objectives: string[]
  features: string[]
  technicalRequirements: string[]
  userExperience: string[]
  improvements: string[]
}

// Generate specifications for a stage using GPT-4o
async function generateStageSpec(
  stageNumber: number,
  theme: string,
  previousStages: GameStageData[],
  apiKey: string,
  model: string,
  stagePlan: string,
  feedback: string,
  totalStages: number,
): Promise<StageSpec> {
  try {
    const stageDescriptions = [
      "Initial game concept with core structure and basic functionality",
      "Enhanced gameplay mechanics and primary user interactions",
      "Complete core features with polished visuals and user experience",
      "Advanced features and algorithmic complexity",
      "Final polish with optimizations and special effects",
    ]

    let prompt = `You are an expert HTML5 game designer creating specifications for a web-based game. 
The game theme is: ${theme}.
This is stage ${stageNumber + 1} of ${totalStages}: ${stageDescriptions[stageNumber] || stageDescriptions[stageDescriptions.length - 1]}.

Please create detailed specifications for this stage of the game development. These specifications will be used to guide the actual code implementation.
`

    // Add context from previous stages if they exist
    if (previousStages.length > 0) {
      prompt += `\nBuild upon the previous stage(s). Here's the latest stage content:\n`
      const latestStage = previousStages[previousStages.length - 1]
      prompt += `\nTitle: ${latestStage.title}\nDescription: ${latestStage.description}\n`

      if (latestStage.md) {
        prompt += `\nDocumentation:\n${latestStage.md}\n`
      }

      prompt += `\nCreate specifications that build upon this foundation and enhance the game for stage ${stageNumber + 1}.`
    }

    // Stage-specific guidance
    switch (stageNumber) {
      case 0:
        prompt += `\nFor this first stage, focus on:
- Basic game structure and core mechanics
- Essential UI elements and controls
- Fundamental gameplay loop
- Visual identity related to the theme
- Responsive design that works in iframe environments
- Ensure the game is playable and fun even at this early stage
- Make sure all game elements are visible and properly positioned
- Use console.log statements to help with debugging
- Ensure the game initializes properly with DOMContentLoaded`
        break
      case 1:
        prompt += `\nFor this second stage, focus on:
- Enhanced game mechanics with more depth
- Improved user interactions and controls
- Game progression systems
- Additional visual elements and feedback
- Better responsiveness and mobile support
- Ensure all core gameplay elements are fully implemented
- Make sure all game elements are visible and properly positioned
- Use console.log statements to help with debugging
- Ensure the game initializes properly with DOMContentLoaded`
        break
      case 2:
        prompt += `\nFor this third stage, focus on:
- Complete game mechanics and systems
- Polished user interface with clear feedback
- Full game loop (start, play, end/restart)
- Refined visuals with animations
- Sound effects or visual cues for important actions
- The game should feel complete and polished at this stage
- Make sure all game elements are visible and properly positioned
- Use console.log statements to help with debugging
- Ensure the game initializes properly with DOMContentLoaded`
        break
      case 3:
        prompt += `\nFor this fourth stage, focus on:
- Advanced game mechanics or algorithms
- Sophisticated scoring or achievement systems
- Special effects or advanced animations
- Additional game modes or challenges
- Enhanced user experience features
- Take the game beyond the basics with more sophisticated features
- Make sure all game elements are visible and properly positioned
- Use console.log statements to help with debugging
- Ensure the game initializes properly with DOMContentLoaded`
        break
      case 4:
        prompt += `\nFor this final stage, focus on:
- Final visual polish and special effects
- Performance optimizations
- Easter eggs or special features
- Final balance adjustments
- Any missing quality-of-life features
- Perfect the game experience with those final touches that make it special
- Make sure all game elements are visible and properly positioned
- Use console.log statements to help with debugging
- Ensure the game initializes properly with DOMContentLoaded`
        break
    }

    if (stagePlan) {
      prompt += `\n\nUSER REQUESTS FOR THIS STAGE:\n${stagePlan}`
    }
    if (feedback) {
      prompt += `\n\nFEEDBACK FROM PREVIOUS STAGE:\n${feedback}`
    }

    prompt += `\nReturn your response in the following JSON format:
{
  "title": "Game Title - Stage ${stageNumber + 1}",
  "objectives": ["Primary objective 1", "Primary objective 2", ...],
  "features": ["Feature to implement 1", "Feature to implement 2", ...],
  "technicalRequirements": ["Technical requirement 1", "Technical requirement 2", ...],
  "userExperience": ["UX consideration 1", "UX consideration 2", ...],
  "improvements": ["Improvement over previous stage 1", "Improvement over previous stage 2", ...]
}

Ensure the specifications are detailed, clear, and focused on creating a game that works well in a browser environment.
Be specific about what should be implemented, not just general ideas.
Focus on making the game fun and engaging for players.`

    // Call OpenAI API to generate specifications using GPT-4o
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert game designer specializing in HTML5 games. You create detailed, practical specifications for web-based games that are fun and engaging.",
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
      throw new Error("Failed to generate stage specifications")
    }

    console.log("Generated specifications:", content)
    return JSON.parse(content) as StageSpec
  } catch (error: any) {
    console.error("Error generating stage specifications:", error)
    throw new Error(`Failed to generate stage specifications: ${error.message}`)
  }
}

// Main function to generate a game stage
export async function generateGameStage(
  stageNumber: number,
  theme: string,
  previousStages: GameStageData[],
  apiKey: string,
  model: string,
  stagePlan: string,
  feedback: string,
  template?: GameTemplate | null,
  totalStages: number,
): Promise<GameStageData> {
  if (model === "offline") {
    if (template) {
      return { ...template, md: `# ${template.title}\n\n${template.description}`, id: `offline-${Date.now()}` }
    }
    return {
      title: "Offline Stage",
      description: "Offline mode placeholder stage.",
      html: `<div id="game-container">Offline mode active</div>`,
      css: "",
      js: "",
      md: "# Offline Mode\n\nNo AI generation.",
      id: `offline-${Date.now()}`,
    }
  }

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
    // Step 1: Generate specifications for this stage using GPT-4o
    console.log(`Generating specifications for stage ${stageNumber + 1}...`)
    const stageSpec = await generateStageSpec(stageNumber, theme, previousStages, apiKey, model, stagePlan, feedback, totalStages)
    console.log("Stage specifications generated:", stageSpec)

    // Step 2: Use the specifications to generate the actual game code using GPT-4o
    console.log(`Generating game code for stage ${stageNumber + 1} based on specifications...`)

    let codePrompt = `You are an expert HTML5 game developer creating a web-based game. 
The game theme is: ${theme}.
This is stage ${stageNumber + 1} of ${totalStages}.

I'll provide you with detailed specifications for this stage, and you need to implement them in code.

SPECIFICATIONS:
Title: ${stageSpec.title}

Objectives:
${stageSpec.objectives.map((obj) => `- ${obj}`).join("\n")}

Features to Implement:
${stageSpec.features.map((feat) => `- ${feat}`).join("\n")}

Technical Requirements:
${stageSpec.technicalRequirements.map((req) => `- ${req}`).join("\n")}

User Experience Considerations:
${stageSpec.userExperience.map((ux) => `- ${ux}`).join("\n")}

Improvements Over Previous Stage:
${stageSpec.improvements.map((imp) => `- ${imp}`).join("\n")}

IMPORTANT BROWSER COMPATIBILITY REQUIREMENTS:
1. The game MUST work properly when embedded in an iframe AND when opened in a new browser window
2. Use document.addEventListener('DOMContentLoaded', function() {...}) to initialize your game
3. Create and append elements to a container div with id="game-container"
4. Make all assets and resources relative (no external dependencies)
5. Ensure all event listeners are properly attached and working
6. Use proper viewport settings for responsive design
7. Add console.log statements to help with debugging
8. Ensure the game is visible and properly sized within the container
9. Test your code logic carefully to avoid runtime errors
10. Ensure all game elements are properly positioned and visible
11. Make sure to handle both mouse and touch events for mobile compatibility
12. Use requestAnimationFrame for animations instead of setInterval when possible

Please generate a web-based game with the following components:
1. HTML structure (return only the content inside the body tag)
2. CSS styling (complete stylesheet)
3. JavaScript code (complete, self-contained script)
4. Markdown documentation explaining the game design, features, and implementation details
`

    // Add previous stage code if available
    if (previousStages.length > 0) {
      const latestStage = previousStages[previousStages.length - 1]
      codePrompt += `\nPREVIOUS STAGE CODE:
      
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

You MUST build upon this code, enhancing it according to the specifications above. Do not start from scratch.
      Ensure you maintain the core functionality while adding the new features.
`
    }

    if (stagePlan) {
      codePrompt += `\n\nUSER REQUESTS FOR THIS STAGE:\n${stagePlan}`
    }
    if (feedback) {
      codePrompt += `\n\nFEEDBACK FROM PREVIOUS STAGE:\n${feedback}`
    }

    codePrompt += `\nReturn your response in the following JSON format:
{
  "title": "Game Title",
  "description": "Brief description of the game and what was added in this stage",
  "html": "HTML code here",
  "css": "CSS code here",
  "js": "JavaScript code here",
  "md": "# Game Documentation\\n\\nMarkdown documentation here"
}

The markdown documentation should explain the game design, features implemented in this stage, and technical details.

FINAL CHECKLIST:
1. Verify the HTML structure is complete and properly formed
2. Ensure CSS styles are properly scoped and work in both iframe and standalone environments
3. Check that JavaScript initializes properly with DOMContentLoaded
4. Confirm all game elements are visible and properly positioned
5. Test all game interactions mentally to ensure they work
6. Add console.log statements for debugging
7. Ensure the game is responsive and works on different screen sizes
8. Make sure the game works in both iframe and standalone environments
9. Verify that all event listeners are properly attached
10. Check that the game state is properly managed

Ensure the HTML, CSS, and JavaScript work together properly and the game is functional in all contexts.`

    try {
      // Call OpenAI API to generate game code using GPT-4o
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert game developer specializing in HTML5 games. You write clean, error-free code that works in modern browsers and iframe environments.",
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
        throw new Error("Failed to generate game stage")
      }

      try {
        const parsedResponse = JSON.parse(content) as GameStageData
        // Ensure the md field exists
        if (!parsedResponse.md) {
          parsedResponse.md = `# ${parsedResponse.title}\n\n${parsedResponse.description}`
        }

        // Add stage specifications to the markdown documentation
        parsedResponse.md = `# ${parsedResponse.title}\n\n${parsedResponse.description}\n\n## Stage ${stageNumber + 1} Specifications\n\n### Objectives\n${stageSpec.objectives.map((obj) => `- ${obj}`).join("\n")}\n\n### Features\n${stageSpec.features.map((feat) => `- ${feat}`).join("\n")}\n\n### Technical Requirements\n${stageSpec.technicalRequirements.map((req) => `- ${req}`).join("\n")}\n\n### User Experience\n${stageSpec.userExperience.map((ux) => `- ${ux}`).join("\n")}\n\n### Improvements\n${stageSpec.improvements.map((imp) => `- ${imp}`).join("\n")}\n\n## Implementation Details\n\n${parsedResponse.md.split("# ")[1]?.split("\n\n").slice(1).join("\n\n") || ""}`

        // Add a unique ID to the game data
        parsedResponse.id = `game-${stageNumber + 1}-${Date.now()}`
        console.log("Generated game with ID:", parsedResponse.id)

        return parsedResponse
      } catch (error) {
        console.error("Failed to parse OpenAI response:", content)
        throw new Error("Failed to parse game stage data")
      }
    } catch (error: any) {
      console.error("OpenAI API error:", error)
      throw new Error(`Failed to generate game stage: ${error.message}`)
    }
  } catch (error: any) {
    console.error("Error in generateGameStage:", error)
    return {
      title: `Error in Stage ${stageNumber + 1}`,
      description: `There was an error generating this stage: ${error.message}`,
      html: `<div class="error-container"><h2>Error Generating Game</h2><p>There was an error communicating with the OpenAI API: ${error.message}</p></div>`,
      css: `.error-container { color: red; text-align: center; padding: 2rem; }`,
      js: `console.error("Failed to generate game stage: ${error.message}");`,
      md: `# Error in Stage ${stageNumber + 1}\n\nThere was an error generating this stage: ${error.message}`,
      id: `error-${Date.now()}`,
    }
  }
}

// Function to fix game code
export async function fixGameCode(
  gameData: GameStageData,
  errorDetails: string,
  apiKey: string,
  model: string = "gpt-4o",
): Promise<GameStageData> {
  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("API key is required to fix game code")
  }

  try {
    console.log("Fixing game code with error details:", errorDetails)

    const fixPrompt = `You are an expert HTML5 game developer. I have a game that is not rendering correctly. Please fix the code.

ERROR DETAILS:
${errorDetails || "The game is not rendering properly. It shows a blank/white screen."}

CURRENT GAME CODE:

HTML:
\`\`\`html
${gameData.html}
\`\`\`

CSS:
\`\`\`css
${gameData.css}
\`\`\`

JavaScript:
\`\`\`javascript
${gameData.js}
\`\`\`

REQUIREMENTS FOR THE FIX:
1. The game MUST work properly when embedded in an iframe AND when opened in a new browser window
2. Use document.addEventListener('DOMContentLoaded', function() {...}) to initialize your game
3. Create and append elements to a container div with id="game-container"
4. Make all assets and resources relative (no external dependencies)
5. Ensure all event listeners are properly attached and working
6. Use proper viewport settings for responsive design
7. Add console.log statements to help with debugging
8. Ensure the game is visible and properly sized within the container
9. Test your code logic carefully to avoid runtime errors
10. Ensure all game elements are properly positioned and visible
11. Make sure to handle both mouse and touch events for mobile compatibility
12. Use requestAnimationFrame for animations instead of setInterval when possible

Please fix the code to ensure it works properly in all environments. Return the fixed code in the following JSON format:

{
  "title": "${gameData.title}",
  "description": "${gameData.description} (Fixed version)",
  "html": "Fixed HTML code here",
  "css": "Fixed CSS code here",
  "js": "Fixed JavaScript code here",
  "md": "# Fixed Game Documentation\\n\\nExplanation of the fixes applied and how they resolve the issues."
}

IMPORTANT: Maintain the core functionality and appearance of the game while fixing the rendering issues.
Focus on making the game visible and interactive in all environments.
Add detailed console.log statements to help with debugging.
Ensure the game initializes properly with DOMContentLoaded.`

    // Call OpenAI API to fix the game code
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert game developer specializing in fixing HTML5 games to work in all browser environments.",
          },
          { role: "user", content: fixPrompt },
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
      throw new Error("Failed to fix game code")
    }

    try {
      const fixedGame = JSON.parse(content) as GameStageData
      // Preserve the original ID
      fixedGame.id = gameData.id

      // Ensure markdown exists before updating it
      fixedGame.md = fixedGame.md || ""

      // Add explanation of fixes to the markdown documentation if not already present
      if (!fixedGame.md.includes("## Fixes Applied")) {
        fixedGame.md +=
          "\n\n## Fixes Applied\n\n" +
          "The following issues were addressed in this fix:\n\n" +
          "1. Ensured proper initialization with DOMContentLoaded\n" +
          "2. Fixed element positioning and visibility issues\n" +
          "3. Added detailed console logging for debugging\n" +
          "4. Improved event handling for better interactivity\n" +
          "5. Enhanced compatibility with both iframe and standalone environments\n"
      }

      return fixedGame
    } catch (error) {
      console.error("Failed to parse fixed game code:", content)
      throw new Error("Failed to parse fixed game code")
    }
  } catch (error: any) {
    console.error("Error fixing game code:", error)
    throw new Error(`Failed to fix game code: ${error.message}`)
  }
}
