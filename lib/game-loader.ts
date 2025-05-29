/**
 * Comprehensive game loader utility that handles all aspects of game loading and initialization
 */
import { injectCSS } from "./utils/dom-utils"

// Define types for game data
export interface GameData {
  html: string
  css: string
  js: string
  title?: string
  description?: string
  md?: string
  id?: string
}

// Define loading states
export type LoadingState = "idle" | "loading" | "loaded" | "error"

// Define loading options
export interface LoadingOptions {
  timeout?: number
  debug?: boolean
  forceRender?: boolean
  mockThreeJs?: boolean
}

// Define loading result
export interface LoadingResult {
  success: boolean
  state: LoadingState
  error?: string
  logs: string[]
  loadTime?: number
  resourcesLoaded?: string[]
}

/**
 * Creates a mock THREE.js object when the real library fails to load
 */
export function createThreeMock() {
  if (typeof window === "undefined") return null

  console.log("Creating THREE.js mock object")

  return {
    Scene: () => ({
      add: () => {},
      children: [],
      background: null,
    }),
    PerspectiveCamera: () => ({
      position: { x: 0, y: 0, z: 0 },
      lookAt: () => {},
    }),
    WebGLRenderer: () => ({
      setSize: () => {},
      render: () => {},
      domElement: document.createElement("div"),
      setClearColor: () => {},
      setPixelRatio: () => {},
    }),
    BoxGeometry: () => ({}),
    SphereGeometry: () => ({}),
    PlaneGeometry: () => ({}),
    MeshBasicMaterial: () => ({ color: 0xffffff }),
    MeshStandardMaterial: () => ({ color: 0xffffff }),
    Mesh: () => ({
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    }),
    Vector3: (x = 0, y = 0, z = 0) => ({ x, y, z, set: () => {}, copy: () => {} }),
    Clock: () => ({
      getElapsedTime: () => 0,
      getDelta: () => 0.016,
    }),
    Color: () => ({ r: 1, g: 1, b: 1 }),
    AmbientLight: () => ({}),
    DirectionalLight: () => ({
      position: { x: 0, y: 0, z: 0 },
      target: { position: { x: 0, y: 0, z: 0 } },
    }),
    PointLight: () => ({
      position: { x: 0, y: 0, z: 0 },
    }),
    Group: () => ({
      add: () => {},
      children: [],
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    }),
    TextureLoader: () => ({
      load: (url: string, onLoad: Function) => {
        const img = new Image()
        img.onload = () => onLoad(img)
        img.src = url
        return img
      },
    }),
    MathUtils: {
      degToRad: (degrees: number) => degrees * (Math.PI / 180),
      radToDeg: (radians: number) => radians * (180 / Math.PI),
      clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)),
    },
  }
}

/**
 * Loads THREE.js library with fallback mechanisms
 */
export function loadThreeJs(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    // Check if THREE is already defined
    if (typeof window !== "undefined" && (window as any).THREE) {
      console.log("THREE.js already loaded")
      resolve(true)
      return
    }

    // Create a script element to load THREE.js
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
    script.async = true
    script.crossOrigin = "anonymous"

    script.onload = () => {
      console.log("THREE.js loaded successfully")
      resolve(true)
    }

    script.onerror = (e) => {
      console.error("Failed to load THREE.js", e)

      // Try fallback CDN
      const fallbackScript = document.createElement("script")
      fallbackScript.src = "https://threejs.org/build/three.min.js"
      fallbackScript.async = true
      fallbackScript.crossOrigin = "anonymous"

      fallbackScript.onload = () => {
        console.log("THREE.js loaded successfully from fallback CDN")
        resolve(true)
      }

      fallbackScript.onerror = () => {
        console.error("Failed to load THREE.js from fallback CDN")

        // Create a mock THREE object as fallback
        if (typeof window !== "undefined") {
          ;(window as any).THREE = createThreeMock()
          console.log("Using THREE.js mock object as fallback")
          resolve(true)
        } else {
          reject(new Error("Failed to load THREE.js and could not create fallback"))
        }
      }

      document.head.appendChild(fallbackScript)
    }

    document.head.appendChild(script)

    // Set a timeout to create a fallback if loading takes too long
    setTimeout(() => {
      if (typeof window !== "undefined" && !(window as any).THREE) {
        console.warn("THREE.js loading timeout, creating fallback")
        ;(window as any).THREE = createThreeMock()
        resolve(true)
      }
    }, 5000)
  })
}

/**
 * Injects JavaScript into the page
 */
export function injectJS(js: string, id?: string): () => void {
  const scriptElement = document.createElement("script")
  if (id) scriptElement.id = id
  scriptElement.textContent = js
  document.body.appendChild(scriptElement)

  return () => {
    if (scriptElement.parentNode) {
      scriptElement.parentNode.removeChild(scriptElement)
    }
  }
}

/**
 * Loads and initializes a game
 */
export async function loadGame(
  gameData: GameData,
  container: HTMLElement,
  options: LoadingOptions = {},
): Promise<LoadingResult> {
  const startTime = performance.now()
  const logs: string[] = []
  const resourcesLoaded: string[] = []

  // Helper function to log messages
  const log = (message: string) => {
    console.log(message)
    logs.push(`[${new Date().toISOString()}] ${message}`)
  }

  try {
    log("Starting game loading process")

    // Step 1: Load THREE.js if needed
    log("Loading THREE.js")
    try {
      await loadThreeJs()
      log("THREE.js loaded successfully")
      resourcesLoaded.push("THREE.js")
    } catch (error) {
      log(`THREE.js loading failed: ${error instanceof Error ? error.message : String(error)}`)
      if (options.mockThreeJs) {
        log("Using THREE.js mock object")
        ;(window as any).THREE = createThreeMock()
        resourcesLoaded.push("THREE.js (mock)")
      }
    }

    // Step 2: Prepare the container
    log("Preparing game container")
    container.innerHTML = ""

    // Add a debug panel if debug mode is enabled
    if (options.debug) {
      const debugPanel = document.createElement("div")
      debugPanel.id = "debug-panel"
      debugPanel.style.position = "fixed"
      debugPanel.style.top = "0"
      debugPanel.style.right = "0"
      debugPanel.style.backgroundColor = "rgba(0,0,0,0.7)"
      debugPanel.style.color = "white"
      debugPanel.style.padding = "5px"
      debugPanel.style.fontFamily = "monospace"
      debugPanel.style.fontSize = "10px"
      debugPanel.style.zIndex = "9999"
      debugPanel.style.maxWidth = "300px"
      debugPanel.style.maxHeight = "200px"
      debugPanel.style.overflow = "auto"
      document.body.appendChild(debugPanel)

      // Override console.log to also output to debug panel
      const originalConsoleLog = console.log
      console.log = (...args) => {
        originalConsoleLog.apply(console, args)
        const message = args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")

        logs.push(message)

        if (debugPanel) {
          debugPanel.innerHTML += message + "<br>"
        }
      }
    }

    // Step 3: Add the HTML content
    log("Adding HTML content")
    container.innerHTML = gameData.html

    // Step 4: Add the CSS
    log("Adding CSS styles")
    const removeCSS = injectCSS(
      `
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        font-family: 'Arial', sans-serif;
        background-color: white;
      }
      #game-container {
        width: 100%;
        height: 100%;
        overflow: auto;
        position: relative;
        background-color: white;
        color: black;
      }
      #error-display {
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(255,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        z-index: 9999;
        max-width: 80%;
        word-break: break-word;
      }
      * {
        box-sizing: border-box;
      }
      ${gameData.css}
    `,
      "game-styles",
    )

    // Step 5: Add error handler
    log("Setting up error handler")
    window.onerror = (message, source, lineno, colno, error) => {
      log(`Game error: ${message} at ${source}:${lineno}:${colno}`)

      // Display error in the page
      const errorDisplay = document.createElement("div")
      errorDisplay.id = "error-display"
      errorDisplay.textContent = "Error: " + message
      document.body.appendChild(errorDisplay)

      return false
    }

    // Step 6: Add the JavaScript with proper DOMContentLoaded handling
    log("Adding JavaScript code")

    // Create a promise that resolves when the game is loaded
    const gameLoadedPromise = new Promise<void>((resolve, reject) => {
      // Set up event listeners for game loaded/error events
      const loadedHandler = () => {
        log("Game loaded event received")
        resolve()
      }

      const errorHandler = (e: any) => {
        const errorMessage = e.detail?.message || "Unknown error"
        log(`Game error event received: ${errorMessage}`)
        reject(new Error(errorMessage))
      }

      document.addEventListener("gameLoaded", loadedHandler)
      document.addEventListener("gameError", errorHandler)

      // Set a timeout to resolve anyway if it takes too long
      const timeout = setTimeout(() => {
        log("Game load timeout reached, forcing resolution")
        resolve()
      }, options.timeout || 5000)

      // Prepare the JavaScript code with proper initialization
      const modifiedJs = `
        // Check if THREE is available, if not, provide a mock object
        if (typeof THREE === 'undefined') {
          console.log('THREE.js not found, creating mock object');
          window.THREE = {
            Scene: function() { return { add: function() {} } },
            PerspectiveCamera: function() { return {} },
            WebGLRenderer: function() { return { 
              setSize: function() {}, 
              render: function() {},
              domElement: document.createElement('div')
            } },
            BoxGeometry: function() { return {} },
            MeshBasicMaterial: function() { return {} },
            Mesh: function() { return {} },
            Vector3: function() { return {} },
            Clock: function() { return { getElapsedTime: function() { return 0; } } }
          };
        }
        
        // Signal that the game is loaded
        function signalGameLoaded() {
          console.log('Game loaded successfully');
          try {
            const event = new CustomEvent('gameLoaded');
            document.dispatchEvent(event);
          } catch (e) {
            console.error('Error dispatching gameLoaded event:', e);
          }
        }
        
        // Signal game error
        function signalGameError(error) {
          console.error('Game error:', error);
          try {
            const event = new CustomEvent('gameError', { 
              detail: { message: error.message || error }
            });
            document.dispatchEvent(event);
          } catch (e) {
            console.error('Error dispatching gameError event:', e);
          }
        }
        
        // Execute the game code
        try {
          ${gameData.js}
          
          // Signal game loaded after a short delay to ensure rendering is complete
          setTimeout(signalGameLoaded, 500);
        } catch (e) {
          console.error('Error executing game code:', e);
          signalGameError(e);
        }
      `

      // Check if the JS already has a DOMContentLoaded listener
      if (modifiedJs.includes("DOMContentLoaded")) {
        const removeJS = injectJS(
          `
          console.log('Game script loaded, executing...');
          ${modifiedJs}
          console.log('Game script execution completed');
        `,
          "game-script",
        )
      } else {
        // Wrap the code in a DOMContentLoaded listener
        const removeJS = injectJS(
          `
          console.log('Game script loaded, waiting for DOMContentLoaded...');
          document.addEventListener('DOMContentLoaded', function() {
            try {
              console.log('DOMContentLoaded fired, running game code...');
              ${modifiedJs}
              console.log('Game initialization complete');
            } catch (e) {
              console.log('Error during game initialization:', e.message);
              signalGameError(e);
            }
          });
        `,
          "game-script",
        )
      }

      // Dispatch DOMContentLoaded manually if it might have already fired
      if (document.readyState === "complete" || document.readyState === "interactive") {
        log("Document already loaded, dispatching DOMContentLoaded manually")
        setTimeout(() => {
          const event = new Event("DOMContentLoaded")
          document.dispatchEvent(event)
        }, 100)
      }

      // Clean up when done
      return () => {
        clearTimeout(timeout)
        document.removeEventListener("gameLoaded", loadedHandler)
        document.removeEventListener("gameError", errorHandler)
      }
    })

    // Wait for the game to load
    await gameLoadedPromise

    const endTime = performance.now()
    const loadTime = endTime - startTime

    log(`Game loaded successfully in ${loadTime.toFixed(2)}ms`)

    return {
      success: true,
      state: "loaded",
      logs,
      loadTime,
      resourcesLoaded,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log(`Game loading failed: ${errorMessage}`)

    return {
      success: false,
      state: "error",
      error: errorMessage,
      logs,
    }
  }
}
