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
        {/* Quiet 藍青 wash with a whisper of 山吹 (spot accent) */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400/20 via-indigo-300/10 to-yamabuki-300/15 blur-3xl" />
        {/* Border glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-300/40 to-indigo-200/20 blur-xl opacity-50" />
        {/* Image container */}
        <div className="relative h-full w-full rounded-3xl overflow-hidden border-4 border-[var(--rvt-border)] shadow-2xl backdrop-blur-sm">
          <Image src={src} alt={alt} fill className="object-cover" priority />
        </div>
      </div>
    </div>
  )
}
