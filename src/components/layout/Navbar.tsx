import { Button } from '../ui/Button'
import type { Theme } from '../../types'

interface NavbarProps {
    theme: Theme
    onToggleTheme: () => void
}

const NAV_ITEMS = [
    { label: 'Explore', href: '#explore' },
    { label: 'Analyze', href: '#analyze-section' },
] as const

export function Navbar({
    theme, 
    onToggleTheme
}: NavbarProps) {
    return (
        <header
            className="
                fixed top-0 left-0 right-0 z-50 h-14
                flex items-center justify-between
                bg-zinc-950/90
                backdrop-blur-md
                border-b border-zinc-800/60
            "
        >
            <a href="/" className="flex items-center">
                <span className="font-mono font-bold text-lg text-zinc-100">Dev</span>
                <span className="font-mono font-bold text-lg text-violet-400">Mind</span>
            </a>

            <nav className="hidden md:flex items-center gap-1">
                {NAV_ITEMS.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="px-3 py-1.5 text-sm text-zinc-400 rounded-md hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
                    >
                        {item.label}
                    </a>
                ))}
            </nav>

            <Button variant='ghost' size='sm' onClick={onToggleTheme}>
                {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
        </header>
    )
}