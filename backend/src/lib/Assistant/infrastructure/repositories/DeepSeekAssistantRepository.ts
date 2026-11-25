import { HttpError } from '../../../Shared/domain/HttpError';
import { AssistantCompletion, AssistantRepository } from '../../domain/AssistantRepository';
import { AssistantMessage } from '../../domain/AssistantMessage';

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-chat';
const TIMEOUT_MS = 25_000;
const MAX_TOKENS = 700;

type DeepSeekResponse = {
  model?: string;
  choices?: Array<{ message?: { content?: string } }>;
  usage?: AssistantCompletion['usage'];
};

function providerError(status: number): HttpError {
  if (status === 401 || status === 403) {
    return new HttpError(502, 'La clave del asistente no es válida.');
  }
  if (status === 402) {
    return new HttpError(502, 'El asistente no tiene saldo disponible.');
  }
  if (status === 429) {
    return new HttpError(
      429,
      'El asistente está recibiendo demasiadas solicitudes. Intenta de nuevo en unos segundos.'
    );
  }
  return new HttpError(502, 'El asistente no está disponible en este momento.');
}

/** Cliente del API de DeepSeek (compatible con OpenAI). La key solo vive en el backend. */
export class DeepSeekAssistantRepository implements AssistantRepository {
  async complete(systemPrompt: string, messages: AssistantMessage[]): Promise<AssistantCompletion> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new HttpError(
        503,
        'El asistente todavía no está configurado. Pide al administrador que active la clave del servicio.'
      );
    }

    const baseUrl = (process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
    const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          temperature: 0.3,
          max_tokens: MAX_TOKENS,
          stream: false,
        }),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => null)) as DeepSeekResponse | null;

      if (!response.ok) {
        throw providerError(response.status);
      }

      const reply = payload?.choices?.[0]?.message?.content?.trim();

      if (!reply) {
        throw new HttpError(502, 'El asistente no devolvió una respuesta.');
      }

      return {
        reply,
        model: payload?.model ?? model,
        usage: payload?.usage,
      };
    } catch (error) {
      if (error instanceof HttpError) throw error;

      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpError(504, 'El asistente tardó demasiado en responder. Intenta de nuevo.');
      }

      throw new HttpError(502, 'No se pudo contactar al asistente.');
    } finally {
      clearTimeout(timer);
    }
  }
}
