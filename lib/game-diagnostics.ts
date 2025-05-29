// Define diagnostic result
export interface DiagnosticResult {
  browserInfo: {
    userAgent: string
    platform: string
    language: string
    cookiesEnabled: boolean
    localStorage: boolean
    webGL: boolean
    webGL2: boolean
    screenSize: {
      width: number
      height: number
    }
    windowSize: {
      width: number
      height: number
    }
  }
  threeJs: {
    available: boolean
    version?: string
    renderer?: string
  }
  localStorage: {
    available: boolean
    size: number
    keys: string[]
    gameKeys: string[]
  }
  domInfo: {
    gameContainer: boolean
    containerSize: {
      width: number
      height: number
    }
    containerVisible: boolean
    containerZIndex: string
    containerPosition: string
  }
  errors: string[]
  warnings: string[]
}

/**
 * Runs a comprehensive diagnostic on the game environment
 */
export function runGameDiagnostics(containerId = "game-container"): DiagnosticResult {
  const result: DiagnosticResult = {
    browserInfo: {
      userAgent: "",
      platform: "",
      language: "",
      cookiesEnabled: false,
      localStorage: false,
      webGL: false,
      webGL2: false,
      screenSize: {
        width: 0,
        height: 0,
      },
      windowSize: {
        width: 0,
        height: 0,
      },
    },
    threeJs: {
      available: false,
    },
    localStorage: {
      available: false,
      size: 0,
      keys: [],
      gameKeys: [],
    },
    domInfo: {
      gameContainer: false,
      containerSize: {
        width: 0,
        height: 0,
      },
      containerVisible: false,
      containerZIndex: "",
      containerPosition: "",
    },
    errors: [],
    warnings: [],
  }

  try {
    // Browser info
    if (typeof navigator !== "undefined") {
      result.browserInfo.userAgent = navigator.userAgent
      result.browserInfo.platform = navigator.platform
      result.browserInfo.language = navigator.language
      result.browserInfo.cookiesEnabled = navigator.cookieEnabled
    } else {
      result.errors.push("Navigator API not available")
    }

    // Screen and window size
    if (typeof window !== "undefined") {
      if (window.screen) {
        result.browserInfo.screenSize.width = window.screen.width
        result.browserInfo.screenSize.height = window.screen.height
      }

      result.browserInfo.windowSize.width = window.innerWidth
      result.browserInfo.windowSize.height = window.innerHeight
    } else {
      result.errors.push("Window API not available")
    }

    // WebGL support
    try {
      const canvas = document.createElement("canvas")
      result.browserInfo.webGL =
        !!window.WebGLRenderingContext && !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      result.browserInfo.webGL2 = !!window.WebGL2RenderingContext && !!canvas.getContext("webgl2")
    } catch (e) {
      result.warnings.push(`WebGL detection error: ${e instanceof Error ? e.message : String(e)}`)
    }

    // THREE.js availability
    if (typeof window !== "undefined" && (window as any).THREE) {
      result.threeJs.available = true

      // Try to get THREE.js version
      try {
        const three = (window as any).THREE
        result.threeJs.version = three.REVISION || "unknown"

        // Try to create a renderer to check capabilities
        const renderer = new three.WebGLRenderer()
        result.threeJs.renderer = renderer.getContext().getParameter(renderer.getContext().VERSION)
      } catch (e) {
        result.warnings.push(`THREE.js inspection error: ${e instanceof Error ? e.message : String(e)}`)
      }
    }

    // localStorage availability and content
    if (typeof localStorage !== "undefined") {
      try {
        const testKey = "__test__"
        localStorage.setItem(testKey, testKey)
        localStorage.removeItem(testKey)
        result.browserInfo.localStorage = true
        result.localStorage.available = true

        // Get all keys
        result.localStorage.keys = Object.keys(localStorage)

        // Get game-related keys
        result.localStorage.gameKeys = result.localStorage.keys.filter(
          (key) =>
            key.startsWith("game-") ||
            key === "generatedGames" ||
            key === "latestGame" ||
            key === "latestGameId" ||
            key === "minimalLatestGame",
        )

        // Calculate total size
        let totalSize = 0
        for (const key of result.localStorage.keys) {
          const value = localStorage.getItem(key) || ""
          totalSize += key.length + value.length
        }
        result.localStorage.size = totalSize
      } catch (e) {
        result.errors.push(`localStorage error: ${e instanceof Error ? e.message : String(e)}`)
      }
    } else {
      result.errors.push("localStorage not available")
    }

    // DOM info
    const container = document.getElementById(containerId)
    if (container) {
      result.domInfo.gameContainer = true

      // Get container size
      const rect = container.getBoundingClientRect()
      result.domInfo.containerSize.width = rect.width
      result.domInfo.containerSize.height = rect.height

      // Check if container is visible
      const style = window.getComputedStyle(container)
      result.domInfo.containerVisible =
        style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0"

      // Get z-index and position
      result.domInfo.containerZIndex = style.zIndex
      result.domInfo.containerPosition = style.position

      // Check if container has zero dimensions
      if (rect.width === 0 || rect.height === 0) {
        result.warnings.push(`Game container has zero dimensions: ${rect.width}x${rect.height}`)
      }

      // Check if container is off-screen
      if (rect.right < 0 || rect.bottom < 0 || rect.left > window.innerWidth || rect.top > window.innerHeight) {
        result.warnings.push("Game container is outside the viewport")
      }
    } else {
      result.errors.push(`Game container with ID "${containerId}" not found`)
    }
  } catch (e) {
    result.errors.push(`Diagnostic error: ${e instanceof Error ? e.message : String(e)}`)
  }

  return result
}

/**
 * Checks if the game environment is ready for initialization
 */
export function isGameEnvironmentReady(containerId = "game-container"): { ready: boolean; issues: string[] } {
  const issues: string[] = []

  // Check if container exists
  const container = document.getElementById(containerId)
  if (!container) {
    issues.push(`Game container with ID "${containerId}" not found`)
    return { ready: false, issues }
  }

  // Check container dimensions
  const rect = container.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    issues.push(`Game container has zero dimensions: ${rect.width}x${rect.height}`)
  }

  // Check if container is visible
  const style = window.getComputedStyle(container)
  if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
    issues.push("Game container is not visible")
  }

  // Check if THREE.js is available if needed
  // This is a simple check - you might want to make this conditional based on game requirements
  if (typeof window !== "undefined" && !(window as any).THREE) {
    issues.push("THREE.js is not available")
  }

  // Check WebGL support if needed
  try {
    const canvas = document.createElement("canvas")
    const hasWebGL =
      !!window.WebGLRenderingContext && !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))

    if (!hasWebGL) {
      issues.push("WebGL is not supported")
    }
  } catch (e) {
    issues.push(`WebGL detection error: ${e instanceof Error ? e.message : String(e)}`)
  }

  return {
    ready: issues.length === 0,
    issues,
  }
}
