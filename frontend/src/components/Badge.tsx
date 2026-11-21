import type { ReactNode } from 'react';

type BadgeProps = {
  tone?: 'green' | 'orange' | 'red' | 'blue' | 'gray';
  children: ReactNode;
};

export function Badge({ tone = 'gray', children }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
