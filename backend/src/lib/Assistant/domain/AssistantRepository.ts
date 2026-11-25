import { AssistantMessage } from './AssistantMessage';

export type AssistantUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export type AssistantCompletion = {
  reply: string;
  model: string;
  usage?: AssistantUsage;
};

export interface AssistantRepository {
  complete(systemPrompt: string, messages: AssistantMessage[]): Promise<AssistantCompletion>;
}
