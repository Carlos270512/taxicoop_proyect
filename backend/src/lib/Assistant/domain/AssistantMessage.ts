export type AssistantRole = 'user' | 'assistant';

export type AssistantMessage = {
  role: AssistantRole;
  content: string;
};

export const MAX_HISTORY_MESSAGES = 12;
export const MAX_MESSAGE_LENGTH = 2000;
