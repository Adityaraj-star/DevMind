import { forwardRef } from "react"
import { cn } from "../../lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: string
    leftIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
        const inputId = id ?? `input-${Math.random().toString(36).substring(2)}`

        return (
            <div className="flex flex-col gap-1.5">

                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-xs font-medium text-[var(--zinc-400)] tracking-wide"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">

                    {leftIcon && (
                        <div
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--zinc-500)"
                            aria-hidden="true"
                        >
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            "w-full h-9 rounded-lg text-sm",
                            "bg-[var(--zinc-900)] border",
                            "text-(--zinc-200) placeholder:text-[var(--zinc-600)]",
                            "transition-colors duration-150",
                            "focus:outline-none focus:ring-2 focus:ring-violet-500/30",
                            leftIcon ? "pl-9 pr-3" : "px-3",
                            error
                                ? "border-red-500/50 focus:border-red-500/50"
                                : "border-[var(--zinc-700)] focus:border-violet-500/50",
                            className
                        )}
                        {...props}
                    />
                </div>

                {error && (
                    <p className="text-xs text-red-400" role="alert" aria-live="polite">
                        {error}
                    </p>
                )}

                {hint && !error && (
                    <p className="text-xs text-[var(--zinc-600)]">{hint}</p>
                )}
            </div>
        )
    }
)

Input.displayName = "Input"