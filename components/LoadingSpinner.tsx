import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-transparent border-t-current',
        sizeClasses[size],
        className
      )}
      aria-label="Loading"
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex h-64 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" className="text-violet-500" />
        <p className="text-sm text-zinc-400 animate-pulse">Loading registrations…</p>
      </div>
    </div>
  )
}
