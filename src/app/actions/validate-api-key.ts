"use server"

export async function validateApiKey(apiKey: string) {
  // Basic format validation first
  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-")) {
    return {
      valid: false,
      error: "Invalid API key format. API keys should start with 'sk-'",
    }
  }

  try {
    // Create a simple fetch request to the OpenAI API instead of using the client
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    // Check if the request was successful
    if (response.ok) {
      return { valid: true }
    } else {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || `API error (${response.status})`
      return { valid: false, error: errorMessage }
    }
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
