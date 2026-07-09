import { cn } from "../../lib/utils"
import { Button } from "../ui/Button"

interface HeroSectionProps {
    onStartAnalyzing: () => void
    className?: string
}

const FEATURES = [
    { icon: '⬡', label: 'Interactive graph' },
    { icon: '⚡', label: 'AI explanations' },
    { icon: '◎', label: 'Dependency analysis' },
    { icon: "⟳", label: "Git time-travel" },
] as const


export function HeroSection({
    onStartAnalyzing,
    className
}: HeroSectionProps) {
    return (
        <section
            className={cn(
                "relative min-h-screen flex flex-col items-center justify-center",
                "pt-14",
                "overflow-hidden",
                className
            )}
            aria-label="Hero section"
        >
            <div
                className="absolute inset-0 z-0"
                aria-hidden="true"
            >
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `
                        linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                />

                <div
                    className="absolute inset-0"
                    style={{
                        background: "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(139,92,246,0.08) 0%, transparent 70%)",
                    }}
                />

                 <div
                    className="absolute top-14 left-0 right-0 h-px"
                    style={{
                        background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)",
                    }}
                />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-6">
                <div className={cn(
                    "flex items-center gap-2 mb-6",
                    "px-3 py-1.5 rounded-full",
                    "bg-violet-500/10 border border-violet-500/20",
                    "text-violet-400 text-xs font-mono tracking-widest uppercase"
                )}>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    AI-Powered Code Architecture Explorer
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                    <span className="text-[var(--zinc-100)]">Visualize </span>
                    <span 
                        className="bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"
                    >
                        any codebase
                    </span>
                    <br />
                    <span className="text-[var(--zinc-100)]">in seconds</span>
                </h1>

                <p className="text-lg md:text-xl text-[var(--zinc-400)] max-w-2xl mb-10 leading-relaxed">
                    Paste code or drop a GitHub URL. DevMind maps every file,
                    import, and dependency into an interactive graph - then uses
                    AI to explain, analyze, and suggest improvements.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-16">
                    <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={onStartAnalyzing}
                         rightIcon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        }
                    >
                        Start analyzing
                    </Button>
                    <Button 
                        variant="secondary" 
                        size="lg"
                        onClick={() => {
                            alert("Demo")
                        }}
                    >
                        See a live example
                    </Button>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                    {FEATURES.map((feature) => (
                        <div 
                            key={feature.label}
                            className={cn(
                                "flex items-center gap-2",
                                "px-3 py-1.5 rounded-lg",
                                "bg-[var(--zinc-900)]/60 border border-[var(--zinc-800)]",
                                "text-[var(--zinc-400)] text-sm"
                            )}
                        >
                            <span className="text-violet-400 text-base"
                            aria-hidden="true">
                                {feature.icon}
                            </span>
                            {feature.label}
                        </div>
                    ))}
                </div>

                <div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
                    aria-hidden="true"
                    >
                    <svg
                        width="20" height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-[var(--zinc-600)]"
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>
            </div>
        </section>
    )
}