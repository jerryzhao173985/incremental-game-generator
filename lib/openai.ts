export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionParams {
  apiKey: string;
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
}

export async function callChatCompletion({
  apiKey,
  messages,
  model = "gpt-4o",
  temperature = 0.7,
}: ChatCompletionParams): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API error (${response.status})`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}


export async function openAIGet(apiKey: string, path: string): Promise<any> {
  const response = await fetch(`https://api.openai.com${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `API error (${response.status})`;
    throw new Error(errorMessage);
  }
  return response.json();
}
