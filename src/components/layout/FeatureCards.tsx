import { cn } from "../../lib/utils"

const FEATURE_CARDS = [
    {
        id: "visualize",
        number: "01",
        title: "Visualize",
        tagline: "See your architecture",
        description:
        "Paste any JavaScript or TypeScript codebase and DevMind instantly builds an interactive force-directed graph of every file and its connections.",
        features: [
        "Auto-detect components, hooks, utils",
        "Import/export dependency edges",
        "File size as node weight",
        "Circular dependency detection",
        ],
        accent: "from-violet-500/20 to-violet-500/0",
        iconPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        iconColor: "text-violet-400",
        borderHover: "hover:border-violet-500/40",
        glowColor: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]",
    },
    {
        id: "explore",
        number: "02",
        title: "Explore",
        tagline: "Understand any file",
        description:
        "Click any node in the graph to get an instant AI explanation of what that file does, why it exists, and how it fits into the larger architecture.",
        features: [
        "Per-file AI explanation",
        "Upstream / downstream deps",
        "Refactor opportunity detection",
        "Pattern recognition (MVC, hooks)",
        ],
        accent: "from-teal-500/20 to-teal-500/0",
        iconPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
        iconColor: "text-teal-400",
        borderHover: "hover:border-teal-500/40",
        glowColor: "group-hover:shadow-[0_0_30px_rgba(20,184,166,0.08)]",
    },
    {
        id: "refactor",
        number: "03",
        title: "Refactor",
        tagline: "Improve with confidence",
        description:
        "DevMind flags code smells, suggests improvements, and generates before/after diffs — so you can improve the architecture without breaking things.",
        features: [
        "AI refactor suggestions",
        "Side-by-side diff view",
        "Dead code detection",
        "Complexity scoring",
        ],
        accent: "from-amber-500/20 to-amber-500/0",
        iconPath: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
        iconColor: "text-amber-400",
        borderHover: "hover:border-amber-500/40",
        glowColor: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]",
    },
] as const

type CardData = (typeof FEATURE_CARDS)[number]

function FeatureCard({ card }: { card: CardData }) {
    return (
        <article
            className={cn(
                "group relative",
                "flex flex-col",
                "rounded-xl p-6",
                "bg-[var(--zinc-900)]/50",
                "border border-[var(--zinc-800)]/80",
                "transition-all duration-300 ease-out",
                card.borderHover,
                card.glowColor,
                "cursor-default"
            )}
        >
            <div
                className={cn(
                "absolute top-0 left-0 right-0 h-px rounded-t-xl",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                )}
                style={{
                background: `linear-gradient(90deg, transparent, ${
                    card.id === "visualize" ? "rgba(139,92,246,0.6)" :
                    card.id === "explore"   ? "rgba(20,184,166,0.6)" :
                                            "rgba(245,158,11,0.6)"
                }, transparent)`
                }}
                aria-hidden="true"
            />

            <span className="font-mono text-xs text-[var(--zinc-600)] mb-4 tracking-widest">
                {card.number}
            </span>

            <div className={cn(
                "w-10 h-10 mb-5 flex items-center justify-center",
                "rounded-lg bg-[var(--zinc-800)]/60 border border-[var(--zinc-700)]/50",
                "transition-colors duration-300",
                "group-hover:border-[var(--zinc-600)]/80"
            )}>
                <svg
                    width="20" height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={card.iconColor}
                    aria-hidden="true"
                >
                    <path d={card.iconPath} />
                </svg>
            </div>

            <h3 className="text-xl font-semibold text-[var(--zinc-100)] mb-1">
                {card.title}
            </h3>
            <p className="text-xs font-mono text-(--zinc-500) mb-4 tracking-wide">
                {card.tagline}
            </p>

            <p className="text-sm text-[var(--zinc-400)] leading-relaxed mb-6">
                {card.description}
            </p>

            <ul className="mt-auto space-y-2" role="list">
                {card.features.map((feature) => (
                <li
                    key={feature}
                    className="flex items-center gap-2.5 text-xs text-(--zinc-500)"
                >
                    <svg
                        width="14" height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className={cn("shrink-0", card.iconColor)}
                        aria-hidden="true"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                </li>
                ))}
            </ul>
        </article>
    )
}

interface FeatureCardsProps {
    className?: string
}

export function FeatureCards({ className }: FeatureCardsProps) {
    return (
        <section
            id="features"
            className={cn("py-24 px-6", className)}
            aria-labelledby="features-heading"
        >
            <div className="max-w-6xl mx-auto">

                <div className="text-center mb-16">
                    <p className="font-mono text-xs text-violet-400 tracking-widest uppercase mb-4">
                        How it works
                    </p>
                    <h2
                        id="features-heading"
                        className="text-3xl md:text-4xl font-bold text-[var(--zinc-100)] mb-4"
                    >
                        Three tools. One workflow.
                    </h2>
                    <p className="text-[var(--zinc-400)] max-w-xl mx-auto text-base leading-relaxed">
                        DevMind gives you everything you need to understand,
                        navigate, and improve any codebase - no setup required.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURE_CARDS.map((card) => (
                        <FeatureCard key={card.id} card={card} />
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-(--zinc-500) text-sm">
                    No account required. Works with any JavaScript or TypeScript project.
                    </p>
                </div>
            </div>
        </section>
    )
}
