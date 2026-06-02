import { cn } from '../../lib/utils'

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger"
type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant  
    size?: ButtonSize        
    isLoading?: boolean      
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {

    primary: [
        "bg-violet-600 text-white",
        "hover:bg-violet-500",
        "active:bg-violet-700",
        "border border-violet-500/50",
        "shadow-[0_0_20px_rgba(139,92,246,0.15)]",
        "hover:shadow-[0_0_25px_rgba(139,92,246,0.3)]",
    ].join(" "),

    secondary: [
        "bg-transparent text-zinc-300",
        "border border-zinc-700",
        "hover:bg-zinc-800 hover:border-zinc-600",
        "active:bg-zinc-700",
    ].join(" "),

    ghost: [
        "bg-transparent text-zinc-400",
        "border border-transparent",
        "hover:bg-zinc-800/60 hover:text-zinc-200",
        "active:bg-zinc-800",
    ].join(" "),

    danger: [
        "bg-transparent text-red-400",
        "border border-red-500/30",
        "hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300",
        "active:bg-red-500/20",
    ].join(" "),
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-7 px-3 text-xs gap-1.5",
    md: "h-9 px-4 text-sm gap-2",
    lg: "h-11 px-6 text-base gap-2.5",
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center",
                "font-medium tracking-wide",
                "rounded-lg",
                "transition-all duration-150 ease-out",
                "cursor-pointer select-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg 
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25" 
                        cx="12" cy="12" r="10" 
                        stroke="currentColor" strokeWidth="4" 
                    />
                    <path 
                        className="opacity-75"
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" 
                    />
                </svg>
            )}

            {leftIcon && !isLoading && (
                <span className="shrink-0" aria-hidden="true">
                {leftIcon}
                </span>
            )}
            {children}
            {rightIcon && !isLoading && (
                <span className="shrink-0" aria-hidden="true">
                {rightIcon}
                </span>
            )}
        </button>
    )
}
