import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, CarFront, UsersRound, UserRound,
  Settings, Bell, Search, ChevronDown, LogOut, ShieldCheck, Vote,
} from 'lucide-react';
import { useAuth } from '@features/auth';

const navigation = [
  { label: 'Panel principal', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'SOCIO'] },
  { label: 'Socios', path: '/socios', icon: UsersRound, roles: ['ADMIN'] },
  { label: 'Vehículos', path: '/vehiculos', icon: CarFront, roles: ['ADMIN'] },
  { label: 'Mi perfil', path: '/perfil', icon: UserRound, roles: ['SOCIO'] },
  { label: 'Votaciones', path: '/votaciones', icon: Vote, roles: ['ADMIN', 'SOCIO'] },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  SOCIO: 'Socio',
};

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes('ADMIN');
  const visibleNavigation = navigation.filter((item) => item.roles.some((role) => roles.includes(role)));

  const name = user?.name ?? 'Administrador';
  const role = roles.length > 0 ? roles.map((value) => ROLE_LABELS[value] ?? value).join(' · ') : 'Gestión general';
  const initials = user?.initials ?? 'AD';

  function handleSignOut() {
    setMenuOpen(false);
    signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div><strong>Pole</strong><span> TAXICOOP</span></div>
        </div>
        <div className="side-caption">MENÚ PRINCIPAL</div>
        <nav className="navigation">
          {visibleNavigation.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {isAdmin ? (
            <NavLink to="/configuracion" className="nav-link"><Settings size={19} /><span>Configuración</span></NavLink>
          ) : null}
          <div className="help-card"><div className="help-icon">?</div><div><strong>¿Necesitas ayuda?</strong><span>Contacta al administrador</span></div></div>
          <div className="sidebar-user">
            <div className="avatar avatar-blue">{initials}</div>
            <div className="user-copy"><strong>{name}</strong><span>{role}</span></div>
            <button type="button" className="sidebar-logout" onClick={handleSignOut} aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark">P</div><strong>Pole Taxicoop</strong></div>
          <div className="top-search"><Search size={17} /><span>Buscar en el sistema...</span><kbd>⌘ K</kbd></div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notificaciones"><Bell size={19} /><i /></button>
            <div className="top-divider" />
            <div className="top-user-wrap">
              <button
                type="button"
                className="top-user"
                onClick={() => setMenuOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <div className="avatar avatar-blue">{initials}</div>
                <div><strong>{name}</strong><span>Cuenta principal</span></div>
                <ChevronDown size={16} className={menuOpen ? 'chevron-open' : undefined} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    className="user-menu"
                    role="menu"
                    initial={{ opacity: 0, y: -7, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -7, scale: 0.97 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                  >
                    <div className="user-menu-head">
                      <ShieldCheck size={15} />
                      <div><strong>{name}</strong><span>{user?.email ?? 'admin@poletaxicoop.com'}</span></div>
                    </div>
                    <button type="button" role="menuitem" onClick={handleSignOut}>
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <section className="page-content">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
      {menuOpen && <button type="button" className="user-menu-backdrop" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}
    </div>
  );
}
