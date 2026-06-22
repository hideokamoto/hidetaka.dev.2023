import { cn } from '@/libs/utils/cn'

type ErrorUIProps = {
  title: string
  message: string
  resetLabel: string
  onReset: () => void
  errorDigest?: string
  errorIdLabel?: string
  className?: string
}

export default function ErrorUI({
  title,
  message,
  resetLabel,
  onReset,
  errorDigest,
  errorIdLabel = 'Error ID:',
  className = '',
}: ErrorUIProps) {
  return (
    <main
      className={cn('flex min-h-dvh items-center justify-center px-4', className)}
      style={{ background: 'var(--rvt-bg)' }}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--rvt-fg)' }}>
            {title}
          </h1>
          <p id="error-description" className="text-lg mb-2" style={{ color: 'var(--rvt-fg2)' }}>
            {message}
          </p>
          {errorDigest && (
            <p className="text-sm font-mono" style={{ color: 'var(--rvt-fg2)' }}>
              {errorIdLabel} {errorDigest}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          aria-describedby="error-description"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {resetLabel}
        </button>
      </div>
    </main>
  )
}
