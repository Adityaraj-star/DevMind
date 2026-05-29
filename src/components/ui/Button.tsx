import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
}

// Style maps
const variants = {
    primary:   'bg-violet-600 text-white hover:bg-violet-500 border border-violet-500/50',
    secondary: 'bg-transparent text-zinc-300 border border-zinc-700 hover:bg-zinc-800',
    ghost:     'bg-transparent text-zinc-400 border border-transparent hover:bg-zinc-800/60',
    danger:    'bg-transparent text-red-400 border border-red-500/30 hover:bg-red-500/10',
}
const sizes = {
    sm: 'h-7 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-base gap-2.5',
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
            'inline-flex items-center justify-center font-medium rounded-lg',
            'transition-all duration-150 cursor-pointer select-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            variants[variant],
            sizes[size],
            className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
                </svg>
            )}
            {children}
        </button>
    )
}
