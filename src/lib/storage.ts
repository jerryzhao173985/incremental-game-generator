/**
 * Safe wrapper for localStorage operations
 */

// Check if localStorage is available
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__test__"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

// Get item from localStorage with error handling
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available")
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error getting item ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Set item in localStorage with error handling and chunking for large data
export function setStorageItem<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available")
    return false
  }

  try {
    const serialized = JSON.stringify(value)

    // Check if the data is too large (close to localStorage limit which is typically 5-10MB)
    if (serialized.length > 4000000) {
      // 4MB threshold
      console.warn(`Data for ${key} is very large (${serialized.length} bytes), may exceed localStorage limits`)
    }

    localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    console.error(`Error setting item ${key} in localStorage:`, error)

    // If the error is a quota exceeded error, try to clear some space
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, trying to clear some space")

      // Try to remove old items
      try {
        // Find items that might be safe to remove
        for (let i = 0; i < localStorage.length; i++) {
          const itemKey = localStorage.key(i)
          if (
            itemKey &&
            itemKey !== key &&
            (itemKey.startsWith("_temp_") || itemKey.includes("cache") || itemKey.includes("old"))
          ) {
            localStorage.removeItem(itemKey)
          }
        }

        // Try again after clearing
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (retryError) {
        console.error("Failed to save data even after clearing space:", retryError)
        return false
      }
    }

    return false
  }
}

// Remove item from localStorage with error handling
export function removeStorageItem(key: string): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available")
    return false
  }

  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error)
    return false
  }
}
