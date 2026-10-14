import { LLMConfig, Message } from '../types';

export function buildRequestBody(config: LLMConfig, messages: Message[]): object {
  const apiMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  if (config.systemPrompt && config.systemPrompt.trim()) {
    apiMessages.unshift({
      role: 'system',
      content: config.systemPrompt,
    });
  }

  return {
    model: config.modelName,
    messages: apiMessages,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    top_p: config.topP,
    stream: config.streamEnabled,
  };
}

export function buildHeaders(config: LLMConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  return headers;
}

export async function sendChatRequest(
  config: LLMConfig,
  messages: Message[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  const body = buildRequestBody(config, messages);
  const headers = buildHeaders(config);

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMsg = errorJson.error.message;
        } else if (errorJson.message) {
          errorMsg = errorJson.message;
        }
      } catch {
        if (errorText) errorMsg += `\n${errorText}`;
      }
      onError(errorMsg);
      return;
    }

    if (config.streamEnabled && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
      onDone();
    } else {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      if (content) {
        onChunk(content);
      }
      onDone();
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Unknown error occurred');
  }
}
