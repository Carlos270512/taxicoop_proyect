import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { HttpError } from '../../../Shared/domain/HttpError';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;

function uploadsDir(): string {
  return path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'));
}

function encryptionKey(): Buffer {
  const secret = process.env.FILE_ENCRYPTION_KEY || process.env.JWT_SECRET;

  if (!secret) {
    throw new HttpError(500, 'FILE_ENCRYPTION_KEY no está configurada en el entorno.');
  }

  return crypto.scryptSync(secret, 'taxicoop-uploads-v1', 32);
}

/** Guarda los documentos cifrados (AES-256-GCM) en disco y los descifra al vuelo. */
export class EncryptedFileStorage {
  async ensureDir(): Promise<void> {
    await fs.mkdir(uploadsDir(), { recursive: true });
  }

  async save(buffer: Buffer): Promise<string> {
    await this.ensureDir();

    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();

    const name = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}.enc`;
    await fs.writeFile(path.join(uploadsDir(), name), Buffer.concat([iv, tag, encrypted]));

    return name;
  }

  async read(name: string): Promise<Buffer> {
    if (!/^[\w.-]+\.enc$/.test(name)) {
      throw new HttpError(400, 'Nombre de archivo no válido.');
    }

    let payload: Buffer;

    try {
      payload = await fs.readFile(path.join(uploadsDir(), name));
    } catch {
      throw new HttpError(404, 'El archivo no está disponible.');
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey(), payload.subarray(0, IV_BYTES));
    decipher.setAuthTag(payload.subarray(IV_BYTES, IV_BYTES + TAG_BYTES));

    return Buffer.concat([decipher.update(payload.subarray(IV_BYTES + TAG_BYTES)), decipher.final()]);
  }
}
