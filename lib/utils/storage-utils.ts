/**
 * Storage utility functions
 */

/**
 * Safely gets an item from localStorage with error handling
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`Error getting item from localStorage: ${key}`, error)
    return null
  }
}

/**
 * Safely sets an item in localStorage with error handling
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.error(`Error setting item in localStorage: ${key}`, error)
    return false
  }
}

/**
 * Safely removes an item from localStorage with error handling
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing item from localStorage: ${key}`, error)
    return false
  }
}

/**
 * Safely parses JSON with error handling
 */
export function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback

  try {
    return JSON.parse(json) as T
  } catch (error) {
    console.error("Error parsing JSON", error)
    return fallback
  }
}
