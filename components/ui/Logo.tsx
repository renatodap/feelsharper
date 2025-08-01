import Link from 'next/link'

interface LogoProps {
  className?: string
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={`font-bold text-2xl tracking-tight text-brand-navy hover:text-brand-amber transition-colors duration-200 ${className}`}
    >
      <span className="relative">
        Feel
        <span className="text-brand-amber">Sharper</span>
        <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-brand-amber to-transparent opacity-60"></div>
      </span>
    </Link>
  )
}
