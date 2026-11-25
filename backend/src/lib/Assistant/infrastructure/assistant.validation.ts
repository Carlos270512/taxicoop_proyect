import { HttpError } from '../../Shared/domain/HttpError';
import { AssistantMessage, MAX_HISTORY_MESSAGES, MAX_MESSAGE_LENGTH } from '../domain/AssistantMessage';

/** Valida y normaliza el historial que llega del frontend. */
export function parseMessages(value: unknown): AssistantMessage[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, 'Debes enviar al menos un mensaje.');
  }

  const messages: AssistantMessage[] = [];

  for (const item of value.slice(-MAX_HISTORY_MESSAGES)) {
    if (!item || typeof item !== 'object') {
      throw new HttpError(400, 'El formato de los mensajes no es válido.');
    }

    const { role, content } = item as { role?: unknown; content?: unknown };

    if (role !== 'user' && role !== 'assistant') {
      throw new HttpError(400, 'El rol del mensaje no es válido.');
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      throw new HttpError(400, 'El mensaje no puede estar vacío.');
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new HttpError(400, `El mensaje supera los ${MAX_MESSAGE_LENGTH} caracteres.`);
    }

    messages.push({ role, content: content.trim() });
  }

  if (!messages.some((message) => message.role === 'user')) {
    throw new HttpError(400, 'Falta la pregunta del usuario.');
  }

  return messages;
}
