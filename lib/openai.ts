export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  response_format?: { type: 'json_object' | 'text' };
}

export async function chatCompletion(
  apiKey: string,
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const body = {
    model: options.model ?? 'gpt-4o',
    messages,
    temperature: options.temperature ?? 0.7,
    response_format: options.response_format ?? { type: 'json_object' },
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `API error (${response.status})`;
    throw new Error(message);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content as string;
}

export async function validateKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.startsWith('sk-')) {
    return { valid: false, error: "Invalid API key format. API keys should start with 'sk-'" };
  }

  const response = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    return { valid: true };
  }

  const errorData = await response.json().catch(() => ({}));
  const message = errorData.error?.message || `API error (${response.status})`;
  return { valid: false, error: message };
}
