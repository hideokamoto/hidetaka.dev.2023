import Image from 'next/image'

type ProfileImageProps = {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'responsive'
  className?: string
}

export default function ProfileImage({ src, alt, size = 'lg', className = '' }: ProfileImageProps) {
  const sizeStyles = {
    sm: 'lg:w-64 max-w-xs',
    md: 'lg:w-80 max-w-sm',
    lg: 'lg:w-96 max-w-sm',
    responsive: 'max-w-xs',
  }

  return (
    <div className={`flex-shrink-0 ${sizeStyles[size]} ${className}`}>
      <div className="relative aspect-square w-full mx-auto lg:mx-0">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400/30 via-purple-400/20 to-cyan-400/20 blur-3xl" />
        {/* Border glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-300/60 via-purple-300/50 to-cyan-300/40 blur-xl opacity-60" />
        {/* Image container */}
        <div className="relative h-full w-full rounded-3xl overflow-hidden border-4 border-[var(--rvt-border)] shadow-2xl backdrop-blur-sm">
          <Image src={src} alt={alt} fill className="object-cover" priority />
        </div>
      </div>
    </div>
  )
}
