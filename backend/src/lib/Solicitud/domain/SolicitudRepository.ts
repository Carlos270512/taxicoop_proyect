import { Archivo, ArchivoTipo, CedulaData, NuevaSolicitud, Solicitud, SolicitudData, SolicitudEstado } from './Solicitud';

export type SolicitudListResult = {
  items: Solicitud[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type SubmitSolicitudInput = {
  data: SolicitudData;
  passwordHash: string;
};

export interface SolicitudRepository {
  create(solicitud: NuevaSolicitud): Promise<Solicitud>;
  findAll(filters: { estado?: SolicitudEstado; page: number; limit: number }): Promise<SolicitudListResult>;
  findById(id: string): Promise<Solicitud | null>;
  findByToken(token: string): Promise<Solicitud | null>;
  submit(id: string, input: SubmitSolicitudInput): Promise<Solicitud | null>;
  markApproved(id: string, socioId: string): Promise<Solicitud | null>;
  markRejected(id: string, motivo: string): Promise<Solicitud | null>;
  getPasswordHash(id: string): Promise<string | null>;
}

export interface ArchivoRepository {
  save(data: {
    solicitudId: string;
    socioId?: string | null;
    tipo: ArchivoTipo;
    nombreOriginal: string;
    mimeType: string;
    tamano: number;
    ruta: string;
  }): Promise<Archivo>;
  findById(id: string): Promise<{ archivo: Archivo; ruta: string } | null>;
  attachToSocio(archivoIds: string[], socioId: string): Promise<void>;
}

export interface CedulaProvider {
  consultar(documento: string, tipo: 'CI' | 'RUC'): Promise<CedulaData>;
}
