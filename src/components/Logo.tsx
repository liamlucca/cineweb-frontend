import { Link } from 'react-router-dom';
import { APP_NAME } from '../hooks/useDocumentTitle.ts';

interface LogoProps {
  // smaller version for the footer
  small?: boolean
}

// The app's play-button icon (the same as public/favicon.svg) and name, linking home
function Logo({ small = false }: LogoProps) {
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight" aria-label={`${APP_NAME} home`}>
      <svg viewBox="0 0 64 64" className={small ? 'w-6 h-6' : 'w-8 h-8'} aria-hidden="true">
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f43f5e" />
            <stop offset="1" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#logo-gradient)" />
        <path d="M25 18 L47 32 L25 46 Z" fill="#fff" />
      </svg>
      <span className={small ? 'text-lg' : 'text-xl'}>{APP_NAME}</span>
    </Link>
  );
}

export default Logo;
