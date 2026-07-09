import { cn } from "../../lib/utils"
import type { SelectedNode, GraphLink } from "../../types"

const TYPE_STYLES: Record<string, string> = {
    component: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    hook:      'bg-teal-500/15 text-teal-300 border-teal-500/25',
    util:      'bg-amber-500/15 text-amber-300 border-amber-500/25',
    config:    'bg-blue-500/15 text-blue-300 border-blue-500/25',
}

interface NodeInfoPanelProps {
    node: SelectedNode
    links: GraphLink[]
    onClose: () => void
}

export function NodeInfoPanel({ node, links, onClose }: NodeInfoPanelProps) {
    // count how many other files import THIS node (incoming connections)
    const incomingCount = node ? links.filter(link => {
        const targetId = typeof link.target === 'string' ? link.target : link.target.id
        return targetId === node.id
    }).length : 0

    // count how many files THIS node imports (outgoing connections)
    const outgoingCount = node ? links.filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id
        return sourceId === node.id
    }).length : 0

    return (
        <aside
            className={cn(
                "fixed top-14 right-0 bottom-0 z-30",
                "w-80 flex flex-col",
                "bg-(--zinc-950) border-l border-(--zinc-800)/60",
                "transition-transform duration-300 ease-in-out",
                node ? "translate-x-0" : "translate-x-full"
            )}
            aria-label="Node details"
            aria-hidden={!node}
        >
            {/* if no node selected, render nothing inside (panel is just off-screen) */}
            {node && (
                <>
                    {/* PANEL HEADER */}
                    <div className="flex items-start justify-between p-4 border-b border-(--zinc-800)/60">
                        <div className="flex-1 min-w-0 mr-3">
                            {/* File name */}
                            <h2 className="text-sm font-semibold text-[var(--zinc-100)] truncate mb-1.5">
                                {node.name}
                            </h2>
                            {/* File path */}
                            <p className="text-[11px] text-[var(--zinc-600)] font-mono truncate mb-2">
                                {node.path}
                            </p>
                            {/* Type badge */}
                            <span className={cn(
                                "inline-flex px-2 py-0.5 rounded text-[10px] font-medium border",
                                TYPE_STYLES[node.type]
                            )}>
                                {node.type}
                            </span>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-md text-(--zinc-500) hover:text-(--zinc-300)
                                hover:bg-(--zinc-800) transition-colors shrink-0"
                            aria-label="Close node details"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* SCROLLABLE CONTENT */}
                    <div className="flex-1 overflow-y-auto">

                        {/* STATS ROW */}
                        <div className="grid grid-cols-3 gap-px bg-[var(--zinc-800)]/40 border-b border-(--zinc-800)/60">
                            {[
                                { label: 'Lines', value: node.linesOfCode },
                                { label: 'Imports', value: node.imports.length },
                                { label: 'Used by', value: incomingCount },
                            ].map(stat => (
                                <div key={stat.label} className="bg-(--zinc-950) px-3 py-3 text-center">
                                    <div className="text-lg font-bold text-[var(--zinc-100)] font-mono">
                                        {stat.value}
                                    </div>
                                    <div className="text-[10px] text-[var(--zinc-600)] mt-0.5">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* IMPORTS LIST*/}
                        {node.imports.length > 0 && (
                            <section className="p-4 border-b border-(--zinc-800)/60">
                                <h3 className="text-[10px] font-semibold text-(--zinc-500) uppercase
                                    tracking-wider mb-2.5">
                                    Imports ({node.imports.length})
                                </h3>
                                <ul className="space-y-1">
                                    {node.imports.map((imp, i) => (
                                        <li key={i}
                                            className="flex items-center gap-2 text-xs font-mono">
                                            {/* Dot to indicate import type:
                                                relative (./ or ../) = internal file = violet
                                                no dot prefix = external package = zinc */}
                                            <span className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                imp.startsWith('.')
                                                    ? "bg-violet-500"   // internal import
                                                    : "bg-[var(--zinc-600)]"     // external package
                                            )} aria-hidden="true" />
                                            <span className={cn(
                                                "truncate",
                                                imp.startsWith('.')
                                                    ? "text-(--zinc-300)"
                                                    : "text-(--zinc-500)"
                                            )}>
                                                {imp}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* EXPORTS LIST */}
                        {node.exports.length > 0 && (
                            <section className="p-4 border-b border-(--zinc-800)/60">
                                <h3 className="text-[10px] font-semibold text-(--zinc-500) uppercase
                                    tracking-wider mb-2.5">
                                    Exports ({node.exports.length})
                                </h3>
                                <ul className="space-y-1">
                                    {node.exports.map((exp, i) => (
                                        <li key={i}
                                            className="text-xs font-mono text-teal-300 truncate
                                                flex items-center gap-2">
                                            <span className="text-[var(--zinc-600)]" aria-hidden="true">↗</span>
                                            {exp}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* CONNECTION SUMMARY */}
                        {(incomingCount > 0 || outgoingCount > 0) && (
                            <section className="p-4 border-b border-(--zinc-800)/60">
                                <h3 className="text-[10px] font-semibold text-(--zinc-500) uppercase
                                    tracking-wider mb-2.5">
                                    Connections
                                </h3>
                                <div className="space-y-2">
                                    {incomingCount > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-(--zinc-500)">Imported by</span>
                                            <span className="text-xs font-mono text-amber-400">
                                                {incomingCount} file{incomingCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                    {outgoingCount > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-(--zinc-500)">Imports from</span>
                                            <span className="text-xs font-mono text-violet-400">
                                                {outgoingCount} file{outgoingCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* AI PLACEHOLDER */}
                        <div className="p-4">
                            <div className={cn(
                                "rounded-xl p-4 border border-dashed border-[var(--zinc-700)]/60",
                                "bg-[var(--zinc-900)]/30 text-center"
                            )}>
                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20
                                    flex items-center justify-center mx-auto mb-3">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="#a78bfa" strokeWidth="1.5" aria-hidden="true">
                                        <path d="M12 8V4H8" />
                                        <rect width="16" height="12" x="4" y="8" rx="2" />
                                        <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
                                    </svg>
                                </div>
                                <p className="text-xs font-medium text-(--zinc-300) mb-1">
                                    AI Explanation
                                </p>
                                <p className="text-[11px] text-[var(--zinc-600)] leading-relaxed">
                                    Claude API explains what this file does and how to improve it
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </aside>
    )
}
