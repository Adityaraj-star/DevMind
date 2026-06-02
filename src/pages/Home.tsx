import { useState } from "react"
import { HeroSection } from "../components/layout/HeroSection"
import { FeatureCards } from "../components/layout/FeatureCards"
import { CodePastePanel } from "../components/layout/CodePastePanel"
import { cn } from "../lib/utils"
import type { AnalysisStatus } from "../types"

export function Home() {
    const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle")
    const [analysisError, setAnalysisError] = useState<string | null>(null)

    const handleAnalyze = (
        code: string,
        language: "javascript" | "typescript"
    ) => {
        setAnalysisStatus("parsing")
        setAnalysisError(null)

        console.log(`[DevMind] Analyzing ${language} code (${code.length} chars)...`)
        console.log("[DevMind] Code preview:", code.substring(0, 100) + "...")

        setTimeout(() => {
        setAnalysisStatus("ready")
        console.log("DevMind Analysis complete!")
        }, 1500)
    }

    const handleScrollToAnalyze = () => {
        const el = document.getElementById("analyze-section")
        el?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100">

            <HeroSection onStartAnalyzing={handleScrollToAnalyze} />

            <div
                className="h-px mx-auto max-w-5xl"
                style={{
                background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)"
                }}
                aria-hidden="true"
            />

            <FeatureCards />

            <div
                className="h-px mx-auto max-w-5xl"
                style={{
                background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)"
                }}
                aria-hidden="true"
            />

            <CodePastePanel
                onAnalyze={handleAnalyze}
                status={analysisStatus}
            />

            {analysisStatus === "ready" && (
                <section
                    className={cn(
                        "max-w-4xl mx-auto px-6 pb-24",
                        "animate-in fade-in duration-500"
                    )}
                    aria-live="polite"
                    aria-label="Analysis result placeholder"
                >
                    <div className={cn(
                        "rounded-2xl p-8",
                        "bg-zinc-900/50 border border-zinc-800",
                        "text-center"
                    )}>
                        <div className={cn(
                        "w-14 h-14 rounded-full mx-auto mb-5",
                        "bg-green-500/15 border border-green-500/25",
                        "flex items-center justify-center"
                        )}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2"
                                className="text-green-400" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                            Analysis complete!
                        </h3>
                        <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                            Code received successfully
                        </p>

                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { label: "Phase 1 ✓", color: "bg-green-500/15 text-green-300 border-green-500/25" },
                                { label: "Phase 2: Routing", color: "bg-zinc-800 text-zinc-500 border-zinc-700" },
                                { label: "Phase 3: Graph", color: "bg-zinc-800 text-zinc-500 border-zinc-700" },
                                { label: "Phase 4: AI", color: "bg-zinc-800 text-zinc-500 border-zinc-700" },
                            ].map((item) => (
                                <span
                                    key={item.label}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs font-mono border",
                                        item.color
                                    )}
                                >
                                    {item.label}
                                </span>
                            ))}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => setAnalysisStatus("idle")}
                                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
                            >
                                Analyze another file
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {analysisStatus === "error" && analysisError && (
                <div
                    className="max-w-4xl mx-auto px-6 pb-24"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className={cn(
                        "rounded-2xl p-6",
                        "bg-red-500/10 border border-red-500/25"
                    )}>
                        <p className="text-red-300 font-medium mb-1">Analysis failed</p>
                        <p className="text-red-400/70 text-sm">{analysisError}</p>
                        <button
                            onClick={() => setAnalysisStatus("idle")}
                            className="mt-3 text-sm text-red-400 hover:text-red-300 transition-colors underline"
                        >
                        Try again
                        </button>
                    </div>
                </div>
            )}

            <footer className="border-t border-zinc-800/60 py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-zinc-100">Dev</span>
                        <span className="font-mono font-bold text-violet-400">Mind</span>
                        <span className="font-mono text-xs text-zinc-600 ml-1">v0.1</span>
                    </div>
                    <p className="text-zinc-600 text-xs font-mono">
                        Built with React · TypeScript · Tailwind · D3
                    </p>
                    <p className="text-zinc-700 text-xs">
                        Beta Build
                    </p>
                </div>
            </footer>
        </main>
    )
}