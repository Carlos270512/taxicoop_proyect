import { CarFront, Route, ShieldAlert, UsersRound, Vote } from 'lucide-react';
import { EmptyState } from '@components/EmptyState';
import type { ActivityType, RecentActivityItem } from '../model/types';

const activityAppearance: Record<ActivityType, { icon: typeof UsersRound; tone: string }> = {
  SOCIO: { icon: UsersRound, tone: 'blue' },
  UNIDAD: { icon: CarFront, tone: 'green' },
  EMERGENCIA: { icon: ShieldAlert, tone: 'orange' },
  VOTACION: { icon: Vote, tone: 'purple' },
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

type RecentActivityProps = {
  items: RecentActivityItem[];
  isLoading: boolean;
};

export function RecentActivity({ items, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <EmptyState
        icon={Route}
        title="Cargando actividad…"
        description="Consultando los últimos movimientos"
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Route}
        title="Aún no hay actividad"
        description="Cuando registres socios, unidades o alertas aparecerán aquí."
      />
    );
  }

  return (
    <div className="activity-list">
      {items.map((item) => {
        const { icon: Icon, tone } = activityAppearance[item.type];
        return (
          <div className="activity-item" key={`${item.type}-${item.id}`}>
            <span className={`activity-icon ${tone}`}>
              <Icon size={15} />
            </span>
            <div className="activity-copy">
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </div>
            <span className="activity-time">{timeAgo(item.createdAt)}</span>
          </div>
        );
      })}
    </div>
  );
}
