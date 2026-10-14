export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface LLMConfig {
  endpoint: string;
  apiKey: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
  streamEnabled: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export const DEFAULT_CONFIG: LLMConfig = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: '',
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  systemPrompt: 'You are a helpful assistant.',
  streamEnabled: true,
};
