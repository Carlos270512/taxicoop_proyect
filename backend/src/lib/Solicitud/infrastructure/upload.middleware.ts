import { NextFunction, Response } from 'express';
import multer from 'multer';
import { HttpError } from '../../Shared/domain/HttpError';
import { MAX_ARCHIVO_BYTES, MIME_PERMITIDOS } from '../domain/Solicitud';

/** Subida en memoria: el archivo se cifra antes de tocar el disco. */
export const uploadDocumento = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_ARCHIVO_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!MIME_PERMITIDOS.includes(file.mimetype)) {
      callback(new HttpError(400, 'Solo se permiten archivos PDF, JPG o PNG.'));
      return;
    }
    callback(null, true);
  },
}).single('archivo');

export function handleUpload(req: import('express').Request, res: Response, next: NextFunction) {
  uploadDocumento(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? `El archivo supera el límite de ${Math.round(MAX_ARCHIVO_BYTES / 1024 / 1024)} MB.`
          : 'No se pudo procesar el archivo.';
      return res.status(400).json({ success: false, error: message });
    }

    if (error instanceof HttpError) {
      return res.status(error.status).json({ success: false, error: error.message });
    }

    if (error) {
      return res.status(400).json({ success: false, error: 'No se pudo procesar el archivo.' });
    }

    return next();
  });
}
