/**
 * Utility for preloading resources needed by games
 */

// Define resource types
export type ResourceType = "image" | "script" | "style" | "font" | "audio" | "video" | "json" | "text"

// Define resource interface
export interface Resource {
  type: ResourceType
  url: string
  crossOrigin?: boolean
  async?: boolean
  defer?: boolean
}

// Define preload result
export interface PreloadResult {
  success: boolean
  loaded: string[]
  failed: string[]
  errors: Record<string, string>
}

/**
 * Preloads a single image
 */
function preloadImage(url: string, crossOrigin = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (crossOrigin) {
      img.crossOrigin = "anonymous"
    }

    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`))

    img.src = url
  })
}

/**
 * Preloads a single script
 */
function preloadScript(url: string, async = true, defer = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = url
    script.async = async
    script.defer = defer

    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`))

    document.head.appendChild(script)
  })
}

/**
 * Preloads a single stylesheet
 */
function preloadStyle(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = url

    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`))

    document.head.appendChild(link)
  })
}

/**
 * Preloads a single font
 */
function preloadFont(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = url
    link.as = "font"
    link.type = "font/woff2" // Adjust based on font type
    link.crossOrigin = "anonymous"

    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load font: ${url}`))

    document.head.appendChild(link)
  })
}

/**
 * Preloads a single audio file
 */
function preloadAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()

    audio.oncanplaythrough = () => resolve()
    audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`))

    audio.src = url
    audio.load()
  })
}

/**
 * Preloads a single video file
 */
function preloadVideo(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")

    video.oncanplaythrough = () => resolve()
    video.onerror = () => reject(new Error(`Failed to load video: ${url}`))

    video.src = url
    video.load()
  })
}

/**
 * Preloads JSON data
 */
function preloadJson(url: string): Promise<void> {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load JSON: ${url}`)
      }
      return response.json()
    })
    .then(() => {})
}

/**
 * Preloads text data
 */
function preloadText(url: string): Promise<void> {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load text: ${url}`)
      }
      return response.text()
    })
    .then(() => {})
}

/**
 * Preloads a single resource based on its type
 */
function preloadResource(resource: Resource): Promise<void> {
  switch (resource.type) {
    case "image":
      return preloadImage(resource.url, resource.crossOrigin)
    case "script":
      return preloadScript(resource.url, resource.async, resource.defer)
    case "style":
      return preloadStyle(resource.url)
    case "font":
      return preloadFont(resource.url)
    case "audio":
      return preloadAudio(resource.url)
    case "video":
      return preloadVideo(resource.url)
    case "json":
      return preloadJson(resource.url)
    case "text":
      return preloadText(resource.url)
    default:
      return Promise.reject(new Error(`Unknown resource type: ${resource.type}`))
  }
}

/**
 * Preloads multiple resources in parallel
 */
export async function preloadResources(resources: Resource[]): Promise<PreloadResult> {
  const result: PreloadResult = {
    success: true,
    loaded: [],
    failed: [],
    errors: {},
  }

  const promises = resources.map((resource) =>
    preloadResource(resource)
      .then(() => {
        result.loaded.push(resource.url)
      })
      .catch((error) => {
        result.failed.push(resource.url)
        result.errors[resource.url] = error.message
        result.success = false
      }),
  )

  await Promise.allSettled(promises)

  return result
}

/**
 * Extracts resources from game code
 */
export function extractResourcesFromGame(html: string, css: string, js: string): Resource[] {
  const resources: Resource[] = []
  const urlRegex = /(?:url\(['"]?|src=['"]|href=['"]|background(-image)?:.*?url\(['"]?)([^'"()]+)/g

  // Helper function to add a resource
  const addResource = (url: string, type: ResourceType) => {
    // Skip data URLs and duplicates
    if (url.startsWith("data:") || resources.some((r) => r.url === url)) {
      return
    }

    resources.push({
      type,
      url,
      crossOrigin: true, // Default to true for safety
    })
  }

  // Helper function to determine resource type from URL
  const getResourceType = (url: string): ResourceType => {
    const extension = url.split(".").pop()?.toLowerCase() || ""

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) {
      return "image"
    } else if (["js"].includes(extension)) {
      return "script"
    } else if (["css"].includes(extension)) {
      return "style"
    } else if (["woff", "woff2", "ttf", "otf", "eot"].includes(extension)) {
      return "font"
    } else if (["mp3", "wav", "ogg"].includes(extension)) {
      return "audio"
    } else if (["mp4", "webm", "ogv"].includes(extension)) {
      return "video"
    } else if (["json"].includes(extension)) {
      return "json"
    } else if (["txt", "md", "html"].includes(extension)) {
      return "text"
    }

    // Default to image for unknown types
    return "image"
  }

  // Extract from HTML
  let match
  while ((match = urlRegex.exec(html)) !== null) {
    const url = match[2].trim()
    if (url) {
      addResource(url, getResourceType(url))
    }
  }

  // Extract from CSS
  urlRegex.lastIndex = 0 // Reset regex
  while ((match = urlRegex.exec(css)) !== null) {
    const url = match[2].trim()
    if (url) {
      addResource(url, getResourceType(url))
    }
  }

  // Extract from JS
  urlRegex.lastIndex = 0 // Reset regex
  while ((match = urlRegex.exec(js)) !== null) {
    const url = match[2].trim()
    if (url) {
      addResource(url, getResourceType(url))
    }
  }

  return resources
}
