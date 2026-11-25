export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type AssistantUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export type AssistantReply = {
  reply: string;
  model: string;
  usage?: AssistantUsage;
};

export type AssistantStatus = {
  configured: boolean;
  model: string;
};

/** Preguntas sugeridas para arrancar la conversacion. */
export const SUGGESTIONS: Record<'ADMIN' | 'SOCIO', string[]> = {
  ADMIN: [
    '¿Cuántos socios activos hay?',
    '¿Qué votaciones están abiertas?',
    '¿Cómo suspendo a un socio?',
    '¿Qué unidades están operativas?',
  ],
  SOCIO: [
    '¿Cuál es mi estado como socio?',
    '¿Qué unidades tengo registradas?',
    '¿Qué votaciones puedo votar?',
    '¿Cómo cambio mi teléfono?',
  ],
};
