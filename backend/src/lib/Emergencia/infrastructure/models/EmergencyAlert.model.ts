import { Schema, model, Document } from 'mongoose';

export interface IEmergencyAlert extends Document {
  socioId: string;       // Referencia lógica al ID del socio en PostgreSQL
  numeroUnidad: string;
  ubicacion: {
    latitud: number;
    longitud: number;
  };
  estado: 'PENDIENTE' | 'EN_ATENCION' | 'RESUELTA';
  createdAt: Date;
}

const EmergencyAlertSchema = new Schema<IEmergencyAlert>(
  {
    socioId: { type: String, required: true },
    numeroUnidad: { type: String, required: true },
    ubicacion: {
      latitud: { type: Number, required: true },
      longitud: { type: Number, required: true },
    },
    estado: {
      type: String,
      enum: ['PENDIENTE', 'EN_ATENCION', 'RESUELTA'],
      default: 'PENDIENTE',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

export const EmergencyAlertModel = model<IEmergencyAlert>('EmergencyAlert', EmergencyAlertSchema);