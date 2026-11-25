import { HttpError } from '../../Shared/domain/HttpError';

const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 20;
const MAX_BUCKETS = 5000;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

/** Limite simple en memoria para no gastar saldo del API con rafagas de preguntas. */
export function checkAssistantRateLimit(key: string): void {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size > MAX_BUCKETS) {
      for (const [id, value] of buckets) {
        if (value.resetAt <= now) buckets.delete(id);
      }
    }

    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  if (bucket.count >= MAX_REQUESTS) {
    const seconds = Math.ceil((bucket.resetAt - now) / 1000);
    throw new HttpError(429, `Demasiadas consultas al asistente. Intenta de nuevo en ${seconds} segundos.`);
  }

  bucket.count += 1;
}
