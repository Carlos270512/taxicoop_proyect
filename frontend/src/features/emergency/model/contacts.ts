export type EmergencyTone = 'red' | 'blue' | 'green' | 'orange';

export type EmergencyContact = {
  id: string;
  label: string;
  number: string;
  detail: string;
  tone: EmergencyTone;
};

const COOP_PHONE = (import.meta.env.VITE_COOP_EMERGENCY_PHONE as string | undefined)?.trim();

export const EMERGENCY_NOTE =
  'Usa estos números solo para emergencias reales. Desde un celular el botón marca directamente.';

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'ecu911',
    label: 'ECU 911',
    number: '911',
    detail: 'Ambulancia, policía y bomberos en una sola llamada',
    tone: 'red',
  },
  {
    id: 'policia',
    label: 'Policía Nacional',
    number: '101',
    detail: 'Robos, asaltos y seguridad',
    tone: 'blue',
  },
  {
    id: 'bomberos',
    label: 'Cuerpo de Bomberos',
    number: '102',
    detail: 'Incendios, rescates y fugas de gas',
    tone: 'orange',
  },
  {
    id: 'cruz-roja',
    label: 'Cruz Roja',
    number: '131',
    detail: 'Atención médica y ambulancias',
    tone: 'green',
  },
  ...(COOP_PHONE
    ? [
        {
          id: 'cooperativa',
          label: 'Central de la cooperativa',
          number: COOP_PHONE,
          detail: 'Reportar una emergencia con tu unidad',
          tone: 'blue' as EmergencyTone,
        },
      ]
    : []),
];
