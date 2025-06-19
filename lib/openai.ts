export interface OpenAIResponse<T> {
  data: T
}

/**
 * Helper for making OpenAI API requests with proper headers and no caching.
 */
export async function callOpenAI<T>(
  path: string,
  apiKey: string,
  options: RequestInit = {},
): Promise<T> {
  const { headers, ...rest } = options
  const response = await fetch(`https://api.openai.com/v1${path}`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  })

  if (!response.ok) {
    let message = `API error (${response.status})`
    try {
      const err = await response.json()
      message = err.error?.message || message
    } catch {
      // ignore json parse errors
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}
