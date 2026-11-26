import { Router, Response } from 'express';
import { HttpError } from '../../Shared/domain/HttpError';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../../Shared/infrastructure/middlewares/auth.middleware';
import { SequelizeSocioRepository } from '../../Socio/infrastructure/repositories/SequelizeSocioRepository';
import { SequelizeUnidadRepository } from '../../Unidad/infrastructure/repositories/SequelizeUnidadRepository';
import { SequelizeSolicitudRepository } from './repositories/SequelizeSolicitudRepository';
import { SequelizeArchivoRepository } from './repositories/SequelizeArchivoRepository';
import { EncryptedFileStorage } from './storage/EncryptedFileStorage';
import { ZuinconsulCedulaProvider } from './ZuinconsulCedulaProvider';
import {
  ApproveSolicitudUseCase,
  CreateSolicitudUseCase,
  GetSolicitudByIdUseCase,
  GetSolicitudesUseCase,
  RejectSolicitudUseCase,
  SubmitSolicitudUseCase,
  GetPublicSolicitudUseCase,
} from '../application/SolicitudUseCases';
import { assertDocumento } from '../application/solicitud.validation';
import { ARCHIVO_TIPOS, ArchivoTipo } from '../domain/Solicitud';
import { handleUpload } from './upload.middleware';

const router = Router();

const solicitudRepository = new SequelizeSolicitudRepository();
const archivoRepository = new SequelizeArchivoRepository();
const socioRepository = new SequelizeSocioRepository();
const unidadRepository = new SequelizeUnidadRepository();
const storage = new EncryptedFileStorage();
const cedulaProvider = new ZuinconsulCedulaProvider();

const createSolicitud = new CreateSolicitudUseCase(solicitudRepository, socioRepository);
const getSolicitudes = new GetSolicitudesUseCase(solicitudRepository);
const getSolicitudById = new GetSolicitudByIdUseCase(solicitudRepository);
const getPublicSolicitud = new GetPublicSolicitudUseCase(solicitudRepository);
const submitSolicitud = new SubmitSolicitudUseCase(solicitudRepository);
const approveSolicitud = new ApproveSolicitudUseCase(
  solicitudRepository,
  archivoRepository,
  socioRepository,
  unidadRepository
);
const rejectSolicitud = new RejectSolicitudUseCase(solicitudRepository);

export function fail(res: Response, error: unknown) {
  let status = 500;
  let message = error instanceof Error ? error.message : 'Error inesperado.';

  if (error instanceof HttpError) {
    status = error.status;
  } else if (error && typeof error === 'object' && 'name' in error) {
    const name = (error as { name: string }).name;
    if (name === 'SequelizeUniqueConstraintError') {
      status = 409;
      message = 'Ya existe un registro con esos datos (cédula, placa o número de unidad).';
    } else if (name === 'SequelizeValidationError') {
      status = 400;
    }
  }

  return res.status(status).json({ success: false, error: message });
}

function parseTipo(value: unknown): ArchivoTipo {
  const tipo = String(value ?? '').toUpperCase() as ArchivoTipo;
  if (!ARCHIVO_TIPOS.includes(tipo)) {
    throw new HttpError(400, 'El tipo de documento no es válido (LICENCIA, CONTRATO o MATRICULA).');
  }
  return tipo;
}

// ---------- Consulta de cédula (solo sesiones internas) ----------
router.get('/cedula/:documento', authenticateJWT, async (req, res) => {
  try {
    const documento = assertDocumento(req.params.documento);
    const data = await cedulaProvider.consultar(documento, documento.length === 13 ? 'RUC' : 'CI');
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return fail(res, error);
  }
});

// ---------- Administración ----------
router.get('/', authenticateJWT, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const result = await getSolicitudes.run({
      estado: req.query.estado as string | undefined,
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/', authenticateJWT, authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const solicitud = await createSolicitud.run(req.body?.socioSalienteId);
    return res.status(201).json({
      success: true,
      message: 'Enlace de postulación creado',
      data: solicitud,
    });
  } catch (error) {
    return fail(res, error);
  }
});

// ---------- Descarga de documentos (solo administración) ----------
router.get(
  '/archivos/:id',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  async (req: AuthenticatedRequest, res) => {
    try {
      const found = await archivoRepository.findById(String(req.params.id));
      if (!found) throw new HttpError(404, 'Documento no encontrado.');

      const buffer = await storage.read(found.ruta);
      const inline = req.query.download === '1' ? 'attachment' : 'inline';
      const filename = encodeURIComponent(found.archivo.nombreOriginal);

      res.setHeader('Content-Type', found.archivo.mimeType);
      res.setHeader('Content-Disposition', `${inline}; filename*=UTF-8''${filename}`);
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(buffer);
    } catch (error) {
      return fail(res, error);
    }
  }
);

router.get('/:id', authenticateJWT, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: await getSolicitudById.run(String(req.params.id)) });
  } catch (error) {
    return fail(res, error);
  }
});

router.patch('/:id/aprobar', authenticateJWT, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const result = await approveSolicitud.run(String(req.params.id));
    return res.status(200).json({ success: true, message: 'Postulación aprobada', data: result });
  } catch (error) {
    return fail(res, error);
  }
});

router.patch('/:id/rechazar', authenticateJWT, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const solicitud = await rejectSolicitud.run(String(req.params.id), req.body?.motivo);
    return res.status(200).json({ success: true, message: 'Postulación rechazada', data: solicitud });
  } catch (error) {
    return fail(res, error);
  }
});

// ---------- Público (formulario externo) ----------
router.get('/publicas/:token', async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: await getPublicSolicitud.run(String(req.params.token)) });
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/publicas/:token/cedula/:documento', async (req, res) => {
  try {
    const documento = assertDocumento(req.params.documento);
    const data = await cedulaProvider.consultar(documento, documento.length === 13 ? 'RUC' : 'CI');
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/publicas/:token/archivos', handleUpload, async (req, res) => {
  try {
    const solicitud = await getPublicSolicitud.run(String(req.params.token));

    if (solicitud.estado !== 'PENDIENTE') {
      throw new HttpError(409, 'Esta postulación ya fue revisada.');
    }

    const file = req.file;
    if (!file) throw new HttpError(400, 'Adjunta un archivo.');

    const tipo = parseTipo(req.body?.tipo);
    const ruta = await storage.save(file.buffer);

    const archivo = await archivoRepository.save({
      solicitudId: solicitud.id,
      tipo,
      nombreOriginal: file.originalname.slice(0, 200),
      mimeType: file.mimetype,
      tamano: file.size,
      ruta,
    });

    return res.status(201).json({ success: true, message: 'Documento cargado', data: archivo });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/publicas/:token', async (req, res) => {
  try {
    const solicitud = await submitSolicitud.run(String(req.params.token), req.body ?? {});
    return res.status(200).json({ success: true, message: 'Postulación enviada', data: solicitud });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
