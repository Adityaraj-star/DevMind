import { Button } from "../ui/Button"

const FEATURES = [
    { icon: '⬡', label: 'Interactive graph' },
    { icon: '⚡', label: 'AI explanations' },
    { icon: '◎', label: 'Dependency analysis' },
] as const


export function HeroSection({
    onStartAnalyzing
}: {
    onStartAnalyzing: () => void
}) {
    return (
        <section
            className="
                relative
                min-h-screen
                flex flex-col
                items-center
                justify-center
                pt-14
                overflow-hidden
            "
        >
            <div
                className="absolute inset-0 opacity-[0.04]"
                aria-hidden="true"
                style={{
                    backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />
            <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-6">
                <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-mono tracking-widest uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    AI-Powered Code Architecture Explorer
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                    <span className="text-zinc-100">Visualize </span>
                    <span className="bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        any codebase
                    </span>
                </h1>

                <div className="flex flex-col sm:flex-row gap-3 mb-16">
                    <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={onStartAnalyzing}
                    >
                        Start analyzing
                    </Button>
                    <Button 
                        variant="secondary" 
                        size="lg"
                    >
                        See a live example
                    </Button>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                    {FEATURES.map(f => (
                        <div key={f.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-400 text-sm">
                        <span className="text-violet-400">{f.icon}</span>{f.label}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}