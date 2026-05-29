import { cn } from '../../lib/utils'
import type { FileNode } from '../../types'

type BadgeVariant = FileNode['type'] | 'success' | 'warning' | 'error'

const styles: Record<BadgeVariant, string> = {
    component: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    hook:      'bg-teal-500/15 text-teal-300 border-teal-500/25',
    util:      'bg-amber-500/15 text-amber-300 border-amber-500/25',
    config:    'bg-blue-500/15 text-blue-300 border-blue-500/25',
    success:   'bg-green-500/15 text-green-300 border-green-500/25',
    warning:   'bg-orange-500/15 text-orange-300 border-orange-500/25',
    error:     'bg-red-500/15 text-red-300 border-red-500/25',
}

export function Badge({ variant = 'component', children, className }: { variant?: BadgeVariant; children: React.ReactNode; className?: string }) {
    return (
        <span className={cn(
            'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border',
            styles[variant],
            className
        )}>{children}</span>
    )
}