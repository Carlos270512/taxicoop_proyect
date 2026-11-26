import { Router, Response } from 'express';
import { HttpError } from '../../Shared/domain/HttpError';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../../Shared/infrastructure/middlewares/auth.middleware';
import { EncryptedFileStorage } from '../../Solicitud/infrastructure/storage/EncryptedFileStorage';
import { handleUpload } from '../../Solicitud/infrastructure/upload.middleware';
import { SequelizeReglamentoRepository } from './repositories/SequelizeReglamentoRepository';

const router = Router();

const reglamentoRepository = new SequelizeReglamentoRepository();
const storage = new EncryptedFileStorage();

function fail(res: Response, error: unknown) {
  let status = 500;
  let message = error instanceof Error ? error.message : 'Error inesperado.';
  if (error instanceof HttpError) status = error.status;
  return res.status(status).json({ success: false, error: message });
}

router.use(authenticateJWT);

// Listado: disponible para administradores y socios
router.get('/', async (_req, res) => {
  try {
    return res.status(200).json({ success: true, data: await reglamentoRepository.findAll() });
  } catch (error) {
    return fail(res, error);
  }
});

// Descarga/visualizacion del PDF (ambos roles)
router.get('/:id/archivo', async (req, res) => {
  try {
    const found = await reglamentoRepository.getRuta(String(req.params.id));
    if (!found) throw new HttpError(404, 'Reglamento no encontrado.');

    const buffer = await storage.read(found.ruta);
    const inline = req.query.download === '1' ? 'attachment' : 'inline';
    const filename = encodeURIComponent(found.reglamento.nombreOriginal);

    res.setHeader('Content-Type', found.reglamento.mimeType);
    res.setHeader('Content-Disposition', `${inline}; filename*=UTF-8''${filename}`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch (error) {
    return fail(res, error);
  }
});

// Subida: solo administracion
router.post('/', authorizeRoles('ADMIN'), handleUpload, async (req: AuthenticatedRequest, res) => {
  try {
    const file = req.file;
    if (!file) throw new HttpError(400, 'Adjunta el PDF del reglamento.');

    if (file.mimetype !== 'application/pdf') {
      throw new HttpError(400, 'El reglamento debe ser un archivo PDF.');
    }

    const titulo = String(req.body?.titulo ?? '').trim();
    const descripcion = String(req.body?.descripcion ?? '').trim();

    if (titulo.length < 3 || titulo.length > 180) {
      throw new HttpError(400, 'Indica un título de 3 a 180 caracteres.');
    }

    const ruta = await storage.save(file.buffer);

    const reglamento = await reglamentoRepository.save({
      titulo,
      descripcion: descripcion || null,
      nombreOriginal: file.originalname.slice(0, 200),
      mimeType: file.mimetype,
      tamano: file.size,
      ruta,
      subidoPor: req.user?.id ?? null,
    });

    return res.status(201).json({ success: true, message: 'Reglamento publicado', data: reglamento });
  } catch (error) {
    return fail(res, error);
  }
});

router.delete('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const removed = await reglamentoRepository.remove(String(req.params.id));
    if (!removed) throw new HttpError(404, 'Reglamento no encontrado.');
    return res.status(200).json({ success: true, message: 'Reglamento eliminado' });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
