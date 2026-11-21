import { useParams } from 'react-router-dom';

const titles: Record<string, string> = {
  socios: 'Socios', conductores: 'Conductores', vehiculos: 'Vehículos',
  carreras: 'Carreras', pagos: 'Pagos', reportes: 'Reportes', configuracion: 'Configuración',
};

export function ModulePage() {
  const { module = '' } = useParams();
  const title = titles[module] ?? 'Sección';
  return (
    <div className="module-page">
      <div className="eyebrow">GESTIÓN</div><h1>{title}</h1>
      <p>Esta sección queda preparada para agregar sus funciones y conectarla con la API.</p>
      <div className="panel module-placeholder"><div className="placeholder-mark">{title.charAt(0)}</div><strong>{title}</strong><span>Cuando definamos qué información necesitas aquí, añadimos la pantalla y sus acciones.</span></div>
    </div>
  );
}
