// Optional typings if using TS in the client to call this API
export interface ClaudeChatRequest {
  model?: string
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
  max_tokens?: number
  system?: string
}

export interface ClaudeChatResponse {
  id: string
  model: string
  content: string
  usage?: unknown
}
