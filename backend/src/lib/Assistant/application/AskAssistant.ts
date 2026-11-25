import { HttpError } from '../../Shared/domain/HttpError';
import { AssistantMessage, MAX_HISTORY_MESSAGES } from '../domain/AssistantMessage';
import { AssistantCompletion, AssistantRepository } from '../domain/AssistantRepository';
import { AssistantRoleName, buildSystemPrompt } from '../domain/systemPrompt';
import { AssistantContextBuilder } from './AssistantContext';

export type AskAssistantInput = {
  userId: string;
  roles: string[];
  messages: AssistantMessage[];
};

/** Caso de uso: responde una pregunta del usuario con contexto real del sistema. */
export class AskAssistantUseCase {
  constructor(
    private readonly assistantRepository: AssistantRepository,
    private readonly contextBuilder: AssistantContextBuilder
  ) {}

  async run({ userId, roles, messages }: AskAssistantInput): Promise<AssistantCompletion> {
    if (messages.length === 0) {
      throw new HttpError(400, 'Debes enviar al menos un mensaje.');
    }

    const role: AssistantRoleName = roles.includes('ADMIN') ? 'ADMIN' : 'SOCIO';
    const history = messages.slice(-MAX_HISTORY_MESSAGES).map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));

    const context = await this.contextBuilder.build({ userId, roles });
    const systemPrompt = buildSystemPrompt(role, context);

    return this.assistantRepository.complete(systemPrompt, history);
  }
}
