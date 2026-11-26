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
    '¿Dónde está la unidad U-101?',
    '¿Cómo está el socio Luis Mera?',
    '¿Cuántos socios activos hay?',
    '¿Cómo quedó la última elección?',
  ],
  SOCIO: [
    '¿Cómo quedó la última elección?',
    '¿Asistí a la última reunión?',
    '¿Cuál es mi estado como socio?',
    '¿Qué votaciones puedo votar?',
  ],
};
