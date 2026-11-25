import { CalendarDays, IdCard, Mail, Phone } from 'lucide-react';
import { SocioStatusBadge } from '@features/socios';
import type { Socio } from '@features/socios';
import { formatDate, initialsOf } from '../model/format';

export function ProfileSummary({ socio }: { socio: Socio }) {
  return (
    <section className="panel profile-hero">
      <div className="avatar avatar-blue profile-avatar">{initialsOf(socio.nombres, socio.apellidos)}</div>
      <div className="profile-copy">
        <div className="profile-name">
          <h2>
            {socio.nombres} {socio.apellidos}
          </h2>
          <SocioStatusBadge estado={socio.estado} />
        </div>
        <div className="profile-tags">
          <span>
            <IdCard size={13} /> {socio.cedulaRuc}
          </span>
          <span>
            <Phone size={13} /> {socio.telefono}
          </span>
          <span>
            <Mail size={13} /> {socio.email ?? 'Sin correo registrado'}
          </span>
          <span>
            <CalendarDays size={13} /> Socio desde {formatDate(socio.createdAt)}
          </span>
        </div>
      </div>
    </section>
  );
}
