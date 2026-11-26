import { NuevoReglamento, Reglamento } from '../../domain/Reglamento';
import { ReglamentoRepository } from '../../domain/ReglamentoRepository';
import { ReglamentoModel } from '../models/Reglamento.model';

function toDomain(row: ReglamentoModel): Reglamento {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    nombreOriginal: row.nombreOriginal,
    mimeType: row.mimeType,
    tamano: Number(row.tamano),
    createdAt: row.createdAt.toISOString(),
  };
}

export class SequelizeReglamentoRepository implements ReglamentoRepository {
  async findAll(): Promise<Reglamento[]> {
    const rows = await ReglamentoModel.findAll({ order: [['createdAt', 'DESC']] });
    return rows.map(toDomain);
  }

  async findById(id: string): Promise<Reglamento | null> {
    const row = await ReglamentoModel.findByPk(id);
    return row ? toDomain(row) : null;
  }

  async getRuta(id: string): Promise<{ reglamento: Reglamento; ruta: string } | null> {
    const row = await ReglamentoModel.findByPk(id);
    return row ? { reglamento: toDomain(row), ruta: row.ruta } : null;
  }

  async save(data: NuevoReglamento): Promise<Reglamento> {
    const row = await ReglamentoModel.create({
      titulo: data.titulo,
      descripcion: data.descripcion ?? null,
      nombreOriginal: data.nombreOriginal,
      mimeType: data.mimeType,
      tamano: data.tamano,
      ruta: data.ruta,
      subidoPor: data.subidoPor ?? null,
    });

    return toDomain(row);
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await ReglamentoModel.destroy({ where: { id } });
    return deleted > 0;
  }
}
