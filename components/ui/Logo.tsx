import Link from 'next/link'

interface LogoProps {
  className?: string
}

// Lightning Logo SVG - Unified across the app
export const LightningLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9z"/>
  </svg>
);

export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link 
      href="/dashboard" 
      className={`font-bold text-2xl tracking-tight text-steel-gray hover:text-sharp-blue transition-colors duration-200 ${className}`}
    >
      <span className="relative inline-flex items-center">
        <span className="font-semibold">Feel</span>
        <span className="text-sharp-blue font-bold ml-1">Sharper</span>
        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-sharp-blue to-energy-orange"></div>
      </span>
    </Link>
  )
}
