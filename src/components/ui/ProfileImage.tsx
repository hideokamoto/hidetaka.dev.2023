import Image from 'next/image'

type ProfileImageProps = {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProfileImage({ src, alt, size = 'lg', className = '' }: ProfileImageProps) {
  const sizeStyles = {
    sm: 'lg:w-64 max-w-xs',
    md: 'lg:w-80 max-w-sm',
    lg: 'lg:w-96 max-w-sm',
  }

  return (
    <div className={`flex-shrink-0 ${sizeStyles[size]} ${className}`}>
      <div className="relative aspect-square w-full mx-auto lg:mx-0">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-300/50 via-purple-300/40 to-cyan-300/30 blur-3xl dark:from-indigo-500/30 dark:via-purple-500/20 dark:to-cyan-500/15" />
        {/* Border glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-300/60 via-purple-300/50 to-cyan-300/40 blur-xl opacity-60" />
        {/* Image container */}
        <div className="relative h-full w-full rounded-3xl overflow-hidden border-4 border-white/90 shadow-2xl backdrop-blur-sm dark:border-white/10">
          <Image src={src} alt={alt} fill className="object-cover" priority />
        </div>
      </div>
    </div>
  )
}
