import { useLocation, Link } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Button } from '../ui/Button'
import { useAppContext } from "../../context/AppContext"


const NAV_ITEMS = [
    { label: "Home",    to: "/" },
    { label: "Analyze", to: "/analyze" },
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

export function Navbar() {
    const { state, dispatch } = useAppContext()

    const location = useLocation()

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 h-14",
                "flex items-center justify-between",
                "bg-zinc-950/90",
                "backdrop-blur-md",
                "border-b border-zinc-800/60",
            )}
        >
            <div className="flex items-center gap-2">
                {/*Show toggle button only if analyses exist*/}
                {state.analyses.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
                        aria-label={state.sidebarOpen ? "Close history" : "Open history"} 
                    >

                        <svg 
                            width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            {state.sidebarOpen
                                ? <path d="M18 6L6 18M6 6l12 12" />
                                : <path d="M4 6h16M4 12h16M4 18h16" />
                            }
                        </svg>
                    </Button>
                )}

                <Link to="/" className="flex items-center group" aria-label="DevMind home">
                    <span className={cn(
                        "font-mono font-bold text-lg tracking-tight",
                        "text-zinc-100 group-hover:text-white transition-colors duration-200"
                    )}>
                        Dev
                    </span>
                    <span className={cn(
                        "font-mono font-bold text-lg tracking-tight",
                        "text-violet-400 group-hover:text-violet-300 transition-colors duration-200"
                    )}>
                        Mind
                    </span>
                    <span className="ml-2 text-[10px] font-mono text-zinc-600 pt-1">
                        v0.1
                    </span>
                </Link>
            </div>

            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.to

                    return (
                        <Link
                            key={item.label}
                            to={item.to}

                            aria-current={isActive ? "page" : undefined}
                            className={cn(
                                "px-3 py-1.5 text-sm rounded-md",
                                "transition-colors duration-150 font-medium tracking-wide",
                                isActive

                                    ? "text-zinc-100 bg-zinc-800"
                                
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                            )}
                        >
                            {item.label}
                        </Link>
                    )
                    
                })}
            </nav>

            <div className="flex items-center gap-2">

                {state.analyses.length > 0 && (
                    <span className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60" aria-hidden="true" />
                        {state.analyses.length} {state.analyses.length === 1 ? "analysis" : "analyses"}
                    </span>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: "TOGGLE_THEME" })}
                    aria-label={state.theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                    className="w-9 h-9 p-0"
                >
                    {state.theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </Button>

                <Button
                    variant="secondary"
                    size="sm"
                    className="hidden md:inline-flex"
                    aria-label="View on GitHub"
                >
                    GitHub
                </Button>

                {/*Analyze code CTA*/}
                <Link to="/analyze">
                    <Button variant="primary" size="sm">
                        Analyze code
                    </Button>
                </Link>
            </div>
        </header>
    )
}