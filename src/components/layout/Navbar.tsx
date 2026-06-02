import { cn } from "../../lib/utils"
import { Button } from '../ui/Button'
import type { Theme } from '../../types'

interface NavbarProps {
    theme: Theme
    onToggleTheme: () => void
    className?: string
}

const NAV_ITEMS = [
    { label: 'Explore', href: '#explore' },
    { label: 'Analyze', href: '#analyze' },
    { label: "Docs", href: "#docs" },
] as const

function SunIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
    )
}

function MoonIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    )
}

export function Navbar({
    theme, 
    onToggleTheme,
    className
}: NavbarProps) {
    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 h-14",
                "flex items-center justify-between",
                "bg-zinc-950/90",
                "backdrop-blur-md",
                "border-b border-zinc-800/60",
                className
            )}
        >
            <a 
                href="/" 
                className="flex items-center"
                aria-label="DevMind home"
            >
                <span className={cn(
                    "font-mono font-bold text-lg tracking-tight",
                    "text-zinc-100",
                    "group-hover:text-white transition-colors duration-200"
                )}>
                    Dev
                </span>
                <span className={cn(
                    "font-mono font-bold text-lg tracking-tight",
                    "text-violet-400",
                    "group-hover:text-violet-300 transition-colors duration-200"
                )}>
                    Mind
                </span>
                <span className="ml-2 text-[10px] font-mono text-zinc-600 pt-1">
                    v0.1
                </span>
            </a>

            <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "px-3 py-1.5",
                            "text-sm text-zinc-400",
                            "rounded-md",
                            "hover:text-zinc-100 hover:bg-zinc-800/60",
                            "transition-colors duration-150",
                            "font-medium tracking-wide"
                        )}
                    >
                        {item.label}
                    </a>
                ))}
            </nav>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleTheme}
                    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    className="w-9 h-9 p-0"
                >
                    {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </Button>

                <Button
                    variant="secondary"
                    size="sm"
                    className="hidden md:inline-flex"
                    aria-label="View on GitHub"
                >
                    GitHub
                </Button>

                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                        const el = document.getElementById("analyze-section")
                        el?.scrollIntoView({ behavior: "smooth" })
                    }}
                >
                    Analyze code
                </Button>
            </div>
        </header>
    )
}