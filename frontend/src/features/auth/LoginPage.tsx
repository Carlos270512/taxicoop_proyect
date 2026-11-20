import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  Sparkles,
  UserRound,
  WifiOff,
} from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { demoCredentials, useAuth } from './AuthContext';
import { PoleLogo } from './PoleLogo';
import '../../styles/login.css';

const perks = [
  { icon: WifiOff, label: '100% sin conexión' },
  { icon: ShieldCheck, label: 'Sesión local' },
  { icon: Sparkles, label: 'Experiencia inmersiva' },
];

const particles = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  left: (index * 37 + 11) % 100,
  top: (index * 53 + 7) % 100,
  delay: (index % 7) * 1.1,
  duration: 5 + (index % 5) * 1.4,
  size: 2 + (index % 3),
}));

const showcaseVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 20 } },
};

type Feedback = { tone: 'error' | 'info'; text: string };

export function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [4, -4]), { stiffness: 110, damping: 20 });
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-5, 5]), { stiffness: 110, damping: 20 });
  const spotlight = useTransform([pointerX, pointerY], (latest: number[]) => {
    const x = latest[0] ?? 0.5;
    const y = latest[1] ?? 0.5;
    return `radial-gradient(circle 520px at ${x * 100}% ${y * 100}%, rgba(56, 189, 248, 0.18), transparent 70%)`;
  });

  const isBusy = status !== 'idle';

  useEffect(() => {
    if (status !== 'success') return;
    const timer = window.setTimeout(() => navigate(from, { replace: true }), 1100);
    return () => window.clearTimeout(timer);
  }, [status, from, navigate]);

  if (user && status === 'idle') {
    return <Navigate to={from} replace />;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  }

  function handlePointerLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  function trackCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState?.('CapsLock') ?? false);
  }

  function fillDemo() {
    setIdentifier(demoCredentials.identifier);
    setPassword(demoCredentials.password);
    setFeedback({ tone: 'info', text: 'Credenciales demo listas. Pulsa «Entrar al panel».' });
    setStatus('idle');
  }

  function recoverAccess() {
    setFeedback({
      tone: 'info',
      text: 'Este ingreso funciona sin conexión. Usa admin / taxicoop para entrar.',
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;

    if (!identifier.trim() || !password) {
      setFeedback({ tone: 'error', text: 'Escribe tu usuario y contraseña para continuar.' });
      return;
    }

    setFeedback(null);
    setStatus('loading');

    try {
      await signIn(identifier, password, remember);
      setStatus('success');
    } catch (cause) {
      setStatus('idle');
      setFeedback({
        tone: 'error',
        text: cause instanceof Error ? cause.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
      });
      passwordRef.current?.focus();
    }
  }

  return (
    <div className="login-shell" onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      <div className="login-aurora" aria-hidden="true">
        <span className="login-blob login-blob-blue" />
        <span className="login-blob login-blob-violet" />
        <span className="login-blob login-blob-cyan" />
        <span className="login-blob login-blob-gold" />
      </div>
      <div className="login-grid" aria-hidden="true" />
      <motion.div className="login-spotlight" style={{ background: spotlight }} aria-hidden="true" />
      <div className="login-particles" aria-hidden="true">
        {particles.map((particle) => (
          <span
            key={particle.id}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      <main className="login-stage">
        <motion.section className="login-showcase" variants={showcaseVariants} initial="hidden" animate="show">
          <motion.div className="login-brand" variants={itemVariants}>
            <PoleLogo size={54} />
            <div>
              <strong>
                Pole<span>TAXICOOP</span>
              </strong>
              <small>Sistema de gestión cooperativa</small>
            </div>
          </motion.div>

          <motion.span className="login-eyebrow" variants={itemVariants}>
            <i /> Plataforma de gestión · v1.0
          </motion.span>

          <motion.h1 variants={itemVariants}>
            La ciudad se mueve.
            <br />
            <em>Tu cooperativa, también.</em>
          </motion.h1>

          <motion.p className="login-lead" variants={itemVariants}>
            Socios, conductores, vehículos y carreras en un solo panel. Ingreso local,
            sin depender de la API.
          </motion.p>

          <motion.div className="login-scene" variants={itemVariants} aria-hidden="true">
            <span className="login-moon" />
            <svg className="login-skyline" viewBox="0 0 460 110" preserveAspectRatio="none">
              <path
                d="M0 110V68h32V40h22v28h20V54h34v14h24V30h28v38h20V58h30v10h22V44h26v24h20V56h32v12h22V36h28v32h18V62h30v48z"
                fill="#08192c"
              />
              <g fill="#7dd3fc" opacity="0.35">
                <rect x="38" y="48" width="4" height="5" rx="1" />
                <rect x="50" y="58" width="4" height="5" rx="1" />
                <rect x="90" y="62" width="4" height="5" rx="1" />
                <rect x="140" y="38" width="4" height="5" rx="1" />
                <rect x="152" y="48" width="4" height="5" rx="1" />
                <rect x="206" y="64" width="4" height="5" rx="1" />
                <rect x="240" y="52" width="4" height="5" rx="1" />
                <rect x="300" y="44" width="4" height="5" rx="1" />
                <rect x="312" y="56" width="4" height="5" rx="1" />
                <rect x="364" y="70" width="4" height="5" rx="1" />
                <rect x="400" y="66" width="4" height="5" rx="1" />
              </g>
            </svg>

            <div className="login-road" />

            <motion.div
              className="login-taxi"
              animate={{ x: [0, 178, 0] }}
              transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
            >
              <svg viewBox="0 0 150 70">
                <defs>
                  <linearGradient id="login-taxi-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffd76a" />
                    <stop offset="1" stopColor="#f2ac16" />
                  </linearGradient>
                  <linearGradient id="login-taxi-window" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#12456f" />
                    <stop offset="1" stopColor="#04101d" />
                  </linearGradient>
                </defs>
                <ellipse cx="75" cy="65" rx="56" ry="4" fill="#000000" opacity="0.35" />
                <rect x="60" y="6" width="28" height="6" rx="3" fill="#0b2742" />
                <rect x="64" y="7" width="20" height="3" rx="1.5" fill="#ffd76a" />
                <path d="M42 35 52 20a8 8 0 0 1 6.4-3h37a8 8 0 0 1 6.6 3.5L112 35z" fill="url(#login-taxi-body)" />
                <rect x="14" y="35" width="122" height="24" rx="10" fill="url(#login-taxi-body)" />
                <path d="M49 32 56.5 21.5a4 4 0 0 1 3.2-1.5H72v12z" fill="url(#login-taxi-window)" />
                <path d="M78 20h15a4 4 0 0 1 3.3 1.7L101 32H78z" fill="url(#login-taxi-window)" />
                <rect x="14" y="42" width="6" height="8" rx="2" fill="#fff3c4" />
                <rect x="130" y="42" width="6" height="8" rx="2" fill="#ff9f6e" />
                <g fill="#0b2742" opacity="0.9">
                  <rect x="66" y="42" width="6" height="6" rx="1" />
                  <rect x="78" y="42" width="6" height="6" rx="1" />
                  <rect x="90" y="42" width="6" height="6" rx="1" />
                  <rect x="72" y="48" width="6" height="6" rx="1" />
                  <rect x="84" y="48" width="6" height="6" rx="1" />
                </g>
                <circle cx="44" cy="59" r="9" fill="#0a1624" stroke="#8fb4d8" strokeWidth="2" />
                <circle cx="106" cy="59" r="9" fill="#0a1624" stroke="#8fb4d8" strokeWidth="2" />
                <g className="login-wheel">
                  <rect x="43" y="54" width="2" height="10" rx="1" fill="#9fc4e8" />
                  <rect x="39" y="58" width="10" height="2" rx="1" fill="#9fc4e8" />
                </g>
                <g className="login-wheel login-wheel-rear">
                  <rect x="105" y="54" width="2" height="10" rx="1" fill="#9fc4e8" />
                  <rect x="101" y="58" width="10" height="2" rx="1" fill="#9fc4e8" />
                </g>
              </svg>
            </motion.div>
          </motion.div>

          <motion.ul className="login-perks" variants={itemVariants}>
            {perks.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon size={15} />
                {label}
              </li>
            ))}
          </motion.ul>
        </motion.section>

        <motion.section
          className="login-card"
          style={{ rotateX, rotateY }}
          variants={itemVariants}
          aria-labelledby="login-title"
        >
          <span className="login-card-shine" aria-hidden="true" />

          <header className="login-card-head">
            <div className="login-live">
              <i /> Acceso offline
            </div>
            <h2 id="login-title">Bienvenido de nuevo</h2>
            <p>
              Entra al panel de gestión de <strong>Pole Taxicoop</strong>.
            </p>
          </header>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <motion.div className="login-field" variants={fieldVariants}>
              <label htmlFor="login-user">Usuario o correo</label>
              <div className="login-input">
                <UserRound size={17} aria-hidden="true" />
                <input
                  id="login-user"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="admin"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  disabled={isBusy}
                  autoFocus
                  aria-invalid={feedback?.tone === 'error'}
                />
              </div>
            </motion.div>

            <motion.div className="login-field" variants={fieldVariants}>
              <label htmlFor="login-password">Contraseña</label>
              <div className="login-input">
                <KeyRound size={17} aria-hidden="true" />
                <input
                  ref={passwordRef}
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyUp={trackCapsLock}
                  onKeyDown={trackCapsLock}
                  disabled={isBusy}
                  aria-invalid={feedback?.tone === 'error'}
                />
                <button
                  type="button"
                  className="login-reveal"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <AnimatePresence>
                {capsLock && (
                  <motion.span
                    className="login-caps"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    Bloq Mayús está activado
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div className="login-options" variants={fieldVariants}>
              <label className="login-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span className="login-check-box" aria-hidden="true">
                  <Check size={12} strokeWidth={3} />
                </span>
                Recordarme
              </label>
              <button type="button" className="login-link" onClick={recoverAccess}>
                ¿Olvidaste tu acceso?
              </button>
            </motion.div>

            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  key={feedback.text}
                  className={`login-feedback ${feedback.tone}`}
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  role={feedback.tone === 'error' ? 'alert' : 'status'}
                >
                  <AlertCircle size={15} aria-hidden="true" />
                  <span>{feedback.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button className="login-submit" type="submit" disabled={isBusy} variants={fieldVariants}>
              <AnimatePresence mode="wait" initial={false}>
                {status === 'loading' ? (
                  <motion.span
                    key="loading"
                    className="login-submit-content"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <Loader2 className="login-spinner" size={18} aria-hidden="true" />
                    Verificando acceso...
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    className="login-submit-content"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    Entrar al panel
                    <ArrowRight size={18} aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <div className="login-demo">
            <span>
              <i /> Acceso demo
            </span>
            <button type="button" onClick={fillDemo}>
              usar <strong>admin / taxicoop</strong>
            </button>
          </div>

          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                className="login-success"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <motion.span
                  className="login-success-icon"
                  initial={{ scale: 0.3, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
                >
                  <Check size={30} strokeWidth={3} />
                </motion.span>
                <strong>¡Bienvenido a Pole Taxicoop!</strong>
                <span>Abriendo tu panel de gestión...</span>
                <div className="login-success-bar">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </main>

      <p className="login-footnote">Pole Taxicoop · Panel de gestión · Modo demostración sin API</p>
    </div>
  );
}
