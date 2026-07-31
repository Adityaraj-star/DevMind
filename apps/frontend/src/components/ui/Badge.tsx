import { cn } from '../../lib/utils'
import type { FileNode } from '../../types'

type BadgeVariant = FileNode['type'] | 'default' | 'success' | 'warning' | 'error'

interface BadgeProps {
    variant?: BadgeVariant
    children: React.ReactNode
    className?: string
}

const badgeVariants: Record<BadgeVariant, string> = {
    component: "bg-violet-500/15 text-violet-300 border-violet-500/25 ring-violet-500/10",
    hook:      "bg-teal-500/15 text-teal-300 border-teal-500/25 ring-teal-500/10",
    util:      "bg-amber-500/15 text-amber-300 border-amber-500/25 ring-amber-500/10",
    config:    "bg-blue-500/15 text-blue-300 border-blue-500/25 ring-blue-500/10",
    default:   "bg-[var(--zinc-700)]/50 text-[var(--zinc-400)] border-[var(--zinc-600)]/50 ring-[var(--zinc-500)]/10",
    success:   "bg-green-500/15 text-green-300 border-green-500/25 ring-green-500/10",
    warning:   "bg-orange-500/15 text-orange-300 border-orange-500/25 ring-orange-500/10",
    error:     "bg-red-500/15 text-red-300 border-red-500/25 ring-red-500/10",
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
    return (
        <span className={cn(
            "inline-flex items-center",
            "px-2 py-0.5",
            "text-xs font-medium tracking-wide",
            "rounded-md border",
            badgeVariants[variant],
            className
        )}>
            {children}
        </span>
    )
}