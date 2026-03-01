import { cn } from '@/lib/utils'

export function PageWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex-1 overflow-y-auto scrollbar-thin', className)}>
      <div className="mx-auto max-w-[1400px] p-4 md:p-6 lg:p-8">
        {children}
      </div>
    </div>
  )
}
