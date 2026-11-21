import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: 'blue' | 'green' | 'purple' | 'orange';
};

export function StatCard({ label, value, note, icon: Icon, tone }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-note">{note}</span>
    </article>
  );
}
