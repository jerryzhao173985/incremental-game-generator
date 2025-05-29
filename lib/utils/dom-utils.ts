/**
 * DOM utility functions
 */

/**
 * Safely injects a script into the page with proper error handling
 */
export function injectScript(src: string, onLoad: () => void, onError: (error: string) => void): () => void {
  // Create script element
  const script = document.createElement("script")
  script.src = src
  script.async = true

  // Set up event handlers
  script.onload = () => {
    console.log(`Script loaded: ${src}`)
    onLoad()
  }

  script.onerror = (e) => {
    console.error(`Failed to load script: ${src}`, e)
    onError(`Failed to load script: ${src}`)
  }

  // Add to document
  document.head.appendChild(script)

  // Return cleanup function
  return () => {
    if (script.parentNode) {
      script.parentNode.removeChild(script)
    }
  }
}

/**
 * Injects inline JavaScript code into the page
 */
export function injectInlineScript(code: string, id?: string): () => void {
  // Create script element
  const script = document.createElement("script")
  script.textContent = code
  if (id) script.id = id

  // Add to document
  document.head.appendChild(script)

  // Return cleanup function
  return () => {
    if (script.parentNode) {
      script.parentNode.removeChild(script)
    }
  }
}

/**
 * Injects CSS into the page
 */
export function injectCSS(css: string, id?: string): () => void {
  const styleElement = document.createElement("style")
  if (id) styleElement.id = id
  styleElement.textContent = css
  document.head.appendChild(styleElement)

  return () => {
    if (styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement)
    }
  }
}
