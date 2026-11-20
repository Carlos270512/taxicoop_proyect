import { motion } from 'framer-motion';

type PoleLogoProps = {
  size?: number;
  animated?: boolean;
  className?: string;
};

export function PoleLogo({ size = 52, animated = true, className }: PoleLogoProps) {
  return (
    <motion.span
      className={`pole-logo${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size }}
      initial={animated ? { opacity: 0, scale: 0.75, rotate: -10 } : false}
      animate={animated ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 180, damping: 14 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" width={size} height={size} focusable="false">
        <defs>
          <linearGradient id="pole-logo-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="0.55" stopColor="#2e80d7" />
            <stop offset="1" stopColor="#7c5cff" />
          </linearGradient>
          <linearGradient id="pole-logo-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.42" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="19" fill="url(#pole-logo-fill)" />
        <rect width="64" height="64" rx="19" fill="url(#pole-logo-gloss)" />
        <path d="M24 46V19h9a9.8 9.8 0 0 1 0 19.6h-3V46z" fill="#ffffff" />
        <path d="M19.5 52h25" stroke="#ffffff" strokeOpacity="0.38" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="46" cy="20" r="6.4" fill="#ffd166" fillOpacity="0.28" />
        <circle cx="46" cy="20" r="3" fill="#ffd166" />
      </svg>
    </motion.span>
  );
}
