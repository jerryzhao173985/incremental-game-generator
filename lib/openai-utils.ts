export const AVAILABLE_MODELS = [
  "gpt-4o",
  "gpt-4-turbo",
  "gpt-3.5-turbo"
]

export async function chatCompletionWithFallback({
  apiKey,
  messages,
  model,
  temperature = 0.7,
}: {
  apiKey: string
  messages: { role: string; content: string }[]
  model: string
  temperature?: number
}) {
  const tried = new Set<string>()
  for (const m of [model, ...AVAILABLE_MODELS]) {
    if (tried.has(m)) continue
    tried.add(m)
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: m,
          messages,
          response_format: { type: "json_object" },
          temperature,
        }),
      })
      if (res.ok) {
        return await res.json()
      }
      const errorData = await res.json().catch(() => ({}))
      console.error(`OpenAI API error with model ${m}:`, errorData)
    } catch (err) {
      console.error(`OpenAI request failed with model ${m}:`, err)
    }
  }
  throw new Error("All models failed to respond")
}
