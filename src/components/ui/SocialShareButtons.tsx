type SocialShareButtonsProps = {
  url: string
  title: string
  lang?: string
  className?: string
}

export default function SocialShareButtons({
  url,
  title,
  lang = 'en',
  className = '',
}: SocialShareButtonsProps) {
  const isJapanese = lang.startsWith('ja')
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    hatena: `https://b.hatena.ne.jp/entry/${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
  }

  const shareButtonLabel = isJapanese ? 'シェア' : 'Share'

  const buttons = [
    {
      name: 'X',
      href: shareLinks.twitter,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'hover:bg-slate-100 dark:hover:bg-zinc-700',
    },
    {
      name: 'Facebook',
      href: shareLinks.facebook,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
          />
        </svg>
      ),
      color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    },
    {
      name: 'はてなブックマーク',
      href: shareLinks.hatena,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 2.5h15A2.5 2.5 0 0122 5v14a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 19V5a2.5 2.5 0 012.5-2.5zm2.5 5v9h3.5c2.5 0 4-1.5 4-4.5S12.5 7.5 10 7.5H7zm3.5 2c1 0 1.5.5 1.5 1.5s-.5 1.5-1.5 1.5H9.5v-3h1zm7.5-.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm0 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
        </svg>
      ),
      color: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20',
    },
    {
      name: 'LinkedIn',
      href: shareLinks.linkedin,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    },
  ]

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {shareButtonLabel}:
        </p>
        <div className="flex gap-2">
          {buttons.map((button) => (
            <a
              key={button.name}
              href={button.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${shareButtonLabel} on ${button.name}`}
              className={`inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-700 p-2 text-slate-600 dark:text-slate-400 transition-colors ${button.color}`}
              title={`${shareButtonLabel} on ${button.name}`}
            >
              {button.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
