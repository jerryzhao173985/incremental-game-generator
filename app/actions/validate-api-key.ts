"use server"

import { callOpenAI } from "@/lib/openai"

export async function validateApiKey(apiKey: string) {
  // Basic format validation first
  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-")) {
    return {
      valid: false,
      error: "Invalid API key format. API keys should start with 'sk-'",
    }
  }

  try {
    // Query a lightweight endpoint to verify the key
    await callOpenAI<{ object: string }>("/models", apiKey, { method: "GET" })
    return { valid: true }
  } catch (error: any) {
    console.error("API key validation error:", error)

    // Provide a more specific error message
    let errorMessage = "Error validating API key"
    if (error.message) {
      errorMessage = error.message
    }

    return { valid: false, error: errorMessage }
  }
}
