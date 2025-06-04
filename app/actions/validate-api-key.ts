"use server"

import { validateKey } from "@/lib/openai"

export async function validateApiKey(apiKey: string) {
  try {
    return await validateKey(apiKey)
  } catch (error: any) {
    console.error("API key validation error:", error)
    const errorMessage = error.message || "Error validating API key"
    return { valid: false, error: errorMessage }
  }
}
