import { PageShell } from "../components/layout/PageShell"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"
import { HeroSection } from "../components/layout/HeroSection"
import { FeatureCards } from "../components/layout/FeatureCards"
import { Button } from "../components/ui/Button"


export function Home() {
    const navigate = useNavigate()

    const { state, dispatch } = useAppContext()

    const handleStartAnalyzing = () => navigate("/analyze")

    return (
        <PageShell>
            <div className="min-h-screen">

                <HeroSection onStartAnalyzing={handleStartAnalyzing} />

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

                {state.analyses.length > 0 && (
                        <section className="py-16 px-6" aria-labelledby="recent-heading">
                            <div className="max-w-4xl mx-auto text-center">
                                <h2 id="recent-heading" className="text-2xl font-bold text-zinc-100 mb-3">
                                    Welcome back
                                </h2>
                                <p className="text-zinc-400 text-sm mb-6">
                                    You have {state.analyses.length} saved {state.analyses.length === 1 ? "analysis" : "analyses"}.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

                                    <Button
                                        variant="secondary"
                                        size="md"
                                        onClick={() => dispatch({ type: "SET_SIDEBAR", payload: true })}
                                    >
                                        Browse history
                                    </Button>

                                    <Button
                                        variant="primary"
                                        size="md"
                                        onClick={() => navigate("/analyze")}
                                    >
                                        New analysis
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}

                    {state.analyses.length === 0 && (
                        <section className="py-24 px-6">
                            <div className="max-w-4xl mx-auto text-center">
                                <p className="text-zinc-400 text-sm mb-6">
                                    Ready to explore your first codebase?
                                </p>
                                
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleStartAnalyzing}
                                    rightIcon={
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    }
                                >
                                    Start analyzing
                                </Button>
                            </div>
                        </section>
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
            </div>
        </PageShell>
    )
}